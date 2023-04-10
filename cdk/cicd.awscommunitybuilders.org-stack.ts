import {
  AssetHashType,
  CfnOutput,
  DockerImage,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  ARecord,
  PublicHostedZone,
  RecordTarget,
  ZoneDelegationRecord,
} from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { execSync, ExecSyncOptions } from 'child_process';
import { Construct } from 'constructs';
import { copySync } from 'fs-extra';
import { join } from 'path';

interface CicdAwscommunitybuildersOrgStackProps extends StackProps {
  name: string;
}

export class CicdAwscommunitybuildersOrgStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: CicdAwscommunitybuildersOrgStackProps
  ) {
    super(scope, id, props);

    const { name } = props;

    const websiteBucket = new Bucket(this, 'WebsiteBucket', {
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity'
    );
    websiteBucket.grantRead(originAccessIdentity);

    const execOptions: ExecSyncOptions = {
      stdio: ['ignore', process.stderr, 'inherit'],
    };

    const bundle = Source.asset(join(__dirname, '../src'), {
      assetHashType: AssetHashType.OUTPUT,
      bundling: {
        command: [
          'sh',
          '-c',
          'echo "Docker build not supported. Please install esbuild."',
        ],
        image: DockerImage.fromRegistry('alpine'),
        local: {
          tryBundle(outputDir: string) {
            try {
              execSync('esbuild --version', execOptions);
              /* c8 ignore next 3 */
            } catch {
              return false;
            }
            execSync('npm run build', execOptions);
            copySync(join(__dirname, '../dist'), outputDir);
            return true;
          },
        },
      },
    });

    const accountDomain = `${name}.awscommunitybuilders.org`;

    const domainName = `cicd.${accountDomain}`;

    const accountZone = PublicHostedZone.fromLookup(this, 'AccountHostedZone', {
      domainName: accountDomain,
    });

    const delegatedZone = new PublicHostedZone(this, 'HostedZone', {
      zoneName: domainName,
    });

    new ZoneDelegationRecord(this, 'ZoneDelegationRecord', {
      nameServers: delegatedZone.hostedZoneNameServers!,
      recordName: domainName,
      zone: accountZone,
    });

    const certificateArn = Secret.fromSecretNameV2(
      this,
      'AccountCertArn',
      '/account/certificateArn'
    );

    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      certificateArn.secretValue.unsafeUnwrap()
    );

    const distribution = new Distribution(this, 'Distribution', {
      certificate,
      defaultBehavior: {
        origin: new S3Origin(websiteBucket, { originAccessIdentity }),
      },
      defaultRootObject: 'index.html',
      domainNames: [domainName],
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    new BucketDeployment(this, 'DeployWebsite', {
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
      sources: [bundle],
    });

    new ARecord(this, 'cicdRecord', {
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: delegatedZone,
    });

    new CfnOutput(this, 'webUrl', { value: distribution.domainName });
  }
}
