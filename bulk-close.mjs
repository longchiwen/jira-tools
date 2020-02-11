const BulkCloseDefaultOptions = {
  searchJql:
    "project = JOAN AND " +
    "status not in (CLOSED) AND " +
    "issuetype not in (Epic) AND " +
    "updatedDate <= -182d AND " +
    "(labels is EMPTY OR labels not in (stale-keep,stale)) " +
    "ORDER BY updatedDate ASC",
  issueUpdate: {
    labels: [
      {
        add: "stale"
      }
    ],
    comment: [
      {
        add: {
          body: `*This issue is being closed because it has been inactive for more than 6 months.*

          - if you believe that the issue is still relevant, please reopen it manually.
          - if you wish to keep this issue open, add a label {{stale-keep}} to it.
          `
        }
      }
    ]
  },
  closeTransitions: ["won't fix", "close", "done"]
};

export default class BulkClose {
  constructor(client,options) {
    this.client = client;
    this.options = Object.assign({}, BulkCloseDefaultOptions,options);
  }

  log(msg, ...other) {
    console.log(msg, ...other);
  }

  async run() {
    this.log("Fetching issues ...");
    const list = await this.getList();
    this.log("Found ", list.length);

    list.forEach(async o => {
      // detect transitions
      const transitions = await this.getAvailableTransitions(o.id);
      const transition = this.detectTransitionId(transitions);

      this.log(
        `Transitioning ${o.id} to ${transition.name} (${transition.id})`
      );
      //await this.closeIssue(o.id, transition.id);
    });

    return list;
  }

  async getList() {
    const MAX = 50;
    let page = 1;
    let result = [];
    let inProgress = true;

    while (inProgress) {
      const startAt = (page - 1) * MAX;
      const response = await this.client.search.search({
        jql: this.options.searchJql,
        startAt: startAt,
        maxResults: MAX
      });

      inProgress = response.total > startAt + response.issues.length;
      page++;

      response.issues.forEach(issue => {
        result.push({
          id: issue.key,
          name: issue.name
        });
      });
    }

    return result;
  }

  async closeIssue(issueKey, transitionId) {
    let update = this.options.issueUpdate;
    let transition = { id: transitionId };
    
    await this.client.issue.editIssue({
      issueKey: issueKey,
      issue: {
        update: update
      }
    });
    await this.client.issue.transitionIssue({
      issueKey: issueKey,
      transition: transition
    });
  }

  async getAvailableTransitions(issueKey) {
    let result = await this.client.issue.getTransitions({
      issueKey: issueKey
    });

    return result.transitions.map(o => ({
      id: o.id,
      name: o.name
    }));
  }

  detectTransitionId(transitionsList) {
    return transitionsList.find(o => {
      if (this.options.closeTransitions.indexOf(o.name.toLowerCase()) > -1) {
        return true;
      }
      return false;
    });
  }
}
