#!/usr/bin/env node
import 'source-map-support/register';

import { App } from 'aws-cdk-lib';

import { CicdAwscommunitybuildersOrgStack } from './cicd.awscommunitybuilders.org-stack';

const app = new App();
new CicdAwscommunitybuildersOrgStack(app, 'CicdAwscommunitybuildersOrgStack', {
  env: {
    account: process.env.ACCOUNT_ID || '799776970420',
    region: process.env.CDK_DEFAULT_REGION,
  },
  name: process.env.ACCOUNT_NAME || 'sandbox',
});
