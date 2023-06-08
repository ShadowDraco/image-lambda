import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { Response } from "node-fetch";

export const handler = async (event) => {
  console.log("The event:", event);

  // create an S3 client cconnection
  const s3Client = new S3Client({ region: "us-west-1" });

  // need some parameters to use the "get" command
  const params = {
    Key: "images.json",
    Bucket: "estorm-lab-17",
  };
  console.log("New event info: ", params);

  let data;
  // convert size to mb
  let imageData = {
    name: event.Records[0].s3.object.key,
    size: `${event.Records[0].s3.object.size / 1048576}mb`,
    type: "jpeg",
  };
  console.log("\n\n IMAGE DATA: ", imageData);
  try {
    let results = await s3Client.send(new GetObjectCommand(params));
    let response = new Response(results.Body);
    console.log("\n\nRESULTS:", results.Body, "\n\nRESPONSE:", response.Body);
    data = await response.json();
    console.log("\n\nDATA", data);
    // check if matching data exists
  } catch (err) {
    console.log("\n\nGET DATA Event", JSON.stringify(event, undefined, "  "));
    console.log(err);
  }

  try {
    // find image by
    let foundImage = data.objects.find(
      (image) => image.name === imageData.name
    );
    console.log("\n\nFOUND IMAGE: ", foundImage);
    if (foundImage) {
      data.objects[foundImage] = imageData;
    } else {
      data.objects.push(imageData);
    }

    const newParams = {
      ...params,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    };

    console.log("NEW PARAMS\n\n", newParams);

    // results and response for putting new data in
    let results = await s3Client.send(new PutObjectCommand(newParams));
    const response = new Response(results.Body);
    console.log("\n\nRESULTS:", results.Body, "\n\nRESPONSE:", response.Body);

    //
  } catch (err) {
    console.log(
      "\n\nSEND NEW DATA EVENT",
      JSON.stringify(event, undefined, "  ")
    );
    console.log(err);
  }

  console.log("this is my json", data);

  const response = {
    statusCode: 200,
    body: data,
  }; //

  return response;
};
