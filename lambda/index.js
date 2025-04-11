const AWS = require("aws-sdk");
const sns = new AWS.SNS();

exports.handler = async function (event) {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));

  const topicArn = process.env.TOPIC_ARN;

  if (!topicArn) {
    throw new Error("TOPIC_ARN environment variable is not set");
  }

  const params = {
    Message: "Good Morning",
    TopicArn: topicArn,
    Subject: "Morning Notification",
  };

  try {
    const result = await sns.publish(params).promise();
    console.log("Message published successfully:", result.MessageId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Message published successfully",
        messageId: result.MessageId,
      }),
    };
  } catch (error) {
    console.error("Error publishing message:", error);
    throw error;
  }
};
