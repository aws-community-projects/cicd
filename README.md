# CI/CD Demo using CDK, GitHub Actions and OIDC

This CDK stack creates a simple web application and deploys it to three different environments using GitHub Actions and OIDC. This technique allows us to avoid creating an IAM User or a long-lived Access Key.

This pipeline runs unit tests, then deploys to sandbox, followed by test, and finally production. If any of these steps fail, the pipeline will stop. Additionally the production environment is gated using [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) so any production deployments require a manual approval.

Thanks to [aripalo](https://twitter.com/aripalo) for coming up with an easy way to create the necessary permissions with [aws-cdk-github-oidc](https://github.com/aripalo/aws-cdk-github-oidc).

The different environments are deployed to separate AWS Accounts as defined by the [Community Builders AWS Organization](https://github.com/aws-community-projects/aws-organization-for-devs). Rather than create an OIDC connection with each of these accounts, the Community Builders Organization uses a Deployments OU which has a cross-account trust relationship to deploy to the application accounts.
