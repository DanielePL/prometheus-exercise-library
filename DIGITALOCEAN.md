# Deploying to DigitalOcean

This guide will help you deploy the Prometheus Exercise Library to DigitalOcean App Platform.

## Prerequisites

1. A DigitalOcean account with billing set up
2. A DigitalOcean Database (MongoDB) already created
3. Your GitHub repository connected to DigitalOcean

## Deployment Steps

### 1. Set up Environment Variables

Before deploying, make sure you have these values ready:

- `MONGODB_URI`: Your MongoDB connection string
  ```
  mongodb+srv://doadmin:YOUR_PASSWORD@db-mongodb-sgp1-43043-7a1c69ce.mongo.ondigitalocean.com/admin?retryWrites=true&w=majority
  ```
- `OPENAI_API_KEY`: Your OpenAI API key
- `JWT_SECRET`: A secure random string for token encryption

### 2. Deploy with App Spec

1. Go to your DigitalOcean dashboard
2. Click on "Apps" in the left sidebar
3. Click "Create App" button
4. Select "GitHub" as your source
5. Connect to your GitHub repository
6. Choose the "Specify App Spec" option
7. Use the `.do/app.yaml` file in this repository
8. Set the environment variables when prompted
9. Review and click "Launch App"

### 3. Verify Deployment

- Monitor the build process in the DigitalOcean dashboard
- Once deployed, you'll receive a URL for your application
- Test the application by visiting the URL
- Check the logs if you encounter any issues

## Troubleshooting

If you encounter issues:

1. Check the build logs in DigitalOcean dashboard
2. Verify your environment variables are set correctly
3. Make sure your MongoDB instance is accessible from the app
4. Confirm your OpenAI API key is valid

## Scaling

You can easily scale your app by:

1. Going to the App settings
2. Selecting the "Resources" tab
3. Adjusting the instance size or number of instances 