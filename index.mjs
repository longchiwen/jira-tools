import JiraClient from "jira-connector";
import BulkClose from "./bulk-close.mjs";
import dotenv from 'dotenv-flow'

dotenv.config()

// Initialize Jira client
var client = new JiraClient({
  host: process.env.JIRA_HOST,
  basic_auth: {
    email: process.env.AUTH_EMAIL,
    api_token: process.env.AUTH_API_KEY
  }
});

let action = new BulkClose(client)
action.run()
