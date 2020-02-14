import JiraClient from "jira-connector";

// Initialize Jira client
const client = new JiraClient({
  host: process.env.JIRA_HOST,
  basic_auth: {
    email: process.env.AUTH_EMAIL,
    api_token: process.env.AUTH_API_KEY
  }
});


export default client

