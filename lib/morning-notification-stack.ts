import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sns from "aws-cdk-lib/aws-sns";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import * as path from "path";

export class MorningNotificationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SNSトピックの作成
    const topic = new sns.Topic(this, "MorningNotificationTopic", {
      displayName: "Morning Notification Topic",
    });

    // Lambda関数のコードを含むアセットを作成
    const lambdaAsset = new Asset(this, "LambdaFunctionAsset", {
      path: path.join(__dirname, "../lambda"),
    });

    // Lambda関数の作成
    const morningLambda = new lambda.Function(
      this,
      "MorningNotificationFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: lambda.Code.fromBucket(
          lambdaAsset.bucket,
          lambdaAsset.s3ObjectKey
        ),
        environment: {
          TOPIC_ARN: topic.topicArn,
        },
      }
    );

    // Lambda関数にSNSへのパブリッシュ権限を付与
    morningLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sns:Publish"],
        resources: [topic.topicArn],
      })
    );

    // CloudWatchイベントルールの作成（毎朝8時に実行）
    // 日本時間（UTC+9）で8時に実行するため、UTCでは前日の23時に設定
    const rule = new events.Rule(this, "MorningScheduleRule", {
      schedule: events.Schedule.cron({
        minute: "0",
        hour: "23",
      }),
    });

    // ルールのターゲットとしてLambda関数を設定
    rule.addTarget(new targets.LambdaFunction(morningLambda));
  }
}
