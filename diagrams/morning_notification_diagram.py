from diagrams import Diagram, Edge
from diagrams.aws.integration import SNS
from diagrams.aws.compute import Lambda
from diagrams.aws.management import Cloudwatch
from diagrams.onprem.client import User

with Diagram("Morning Notification Architecture", show=False, direction="LR"):
    # コンポーネントの定義
    events = Cloudwatch("CloudWatch Events\n(毎朝8時に実行)")
    lambda_fn = Lambda("Morning Notification\nLambda Function")
    topic = SNS("SNS Topic")
    user = User("End User")
    
    # コンポーネント間の接続
    events >> Edge(label="トリガー") >> lambda_fn
    lambda_fn >> Edge(label="メッセージ送信") >> topic
    topic >> Edge(label="通知") >> user
