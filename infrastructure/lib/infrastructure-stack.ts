import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Cognito User Pool (existing code)
    const userPool = new cognito.UserPool(this, 'MedicalAppUserPool', {
      userPoolName: 'medical-app-users',
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      }
    });

    const userPoolClient = userPool.addClient('MedicalAppClient', {
      userPoolClientName: 'medical-app-client',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

    // Create S3 bucket
    const recordingsBucket = new s3.Bucket(this, 'RecordingsBucket', {
      bucketName: `medical-app-recordings-${this.account}`, // Makes bucket name unique
      versioned: true,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT],
        allowedOrigins: ['*'], // Restrict this in production
        allowedHeaders: ['*'],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY // For development only
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'MedicalAppAPI', {
      restApiName: 'Medical App API',
      description: 'API for medical conversation app',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Output all important values
    new cdk.CfnOutput(this, 'UserPoolId', { 
      value: userPool.userPoolId 
    });
    
    new cdk.CfnOutput(this, 'UserPoolClientId', { 
      value: userPoolClient.userPoolClientId 
    });

    new cdk.CfnOutput(this, 'BucketName', { 
      value: recordingsBucket.bucketName 
    });

    new cdk.CfnOutput(this, 'ApiUrl', { 
      value: api.url 
    });
  }
}