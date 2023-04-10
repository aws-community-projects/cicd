import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, expect, test } from 'vitest';

import { CicdAwscommunitybuildersOrgStack } from './cicd.awscommunitybuilders.org-stack';

describe('Entire Stack', () => {
  test('match a snapshot', () => {
    const app = new App();
    const stack = new CicdAwscommunitybuildersOrgStack(app, 'test-stack', {
      env: { account: '123456', region: 'eu-west-1' },
      name: 'test',
    });
    const template = Template.fromStack(stack);

    expect(template).toMatchSnapshot();
  });
});
