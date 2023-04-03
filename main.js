const core = require('@actions/core')
const { Octokit } = require('@octokit/core')
const { paginateRest } = require('@octokit/plugin-paginate-rest')

async function main() {
  try {
    const owner = core.getInput('owner')
    const repo = core.getInput('repo')
    const token = core.getInput('github-token', { required: true })
    const pull_number = core.getInput('pull_number')

    const MyOctokit = Octokit.plugin(paginateRest)
    const octokit = new MyOctokit({ auth: 'token ' + token })
    core.info(token)
    core.info(core.info(JSON.stringify(octokit, null, 2)))
    core.info(core.info(JSON.stringify(octokit.rest, null, 2)))
    const required_users = ['lorrydriveloper', 'simonpjones', 'madwire']
    const reviews = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number,
    })
    // core.info(JSON.stringify(reviews.data, null, 2))
    let approved_users = []
    let change_request_users = []
    // Get the usernames of users who have approved the pull request
    reviews.data.forEach((review) => {
      let user = review.user.login
      if (review.state === 'APPROVED') {
        approved_users.push(user)
        approved_users = [...new Set(approved_users)]
        change_request_users = change_request_users.filter((item) => item != user)
      } else if (review.state === 'CHANGES_REQUESTED') {
        change_request_users.push(user)
        change_request_users = [...new Set(change_request_users)]
      }
    })

    console.log(`Approved users: ${approved_users.join(', ')}`)
    console.log(`change Request Users: ${change_request_users.join(', ')}`)

    // Check if there are no changes requested and at least one of the required users has approved the pull request
    const has_required_approval = approved_users.some((user) => required_users.includes(user))
    const has_changes_requested = change_request_users.length > 0

    if (!has_changes_requested && has_required_approval) {
      core.setOutput('reviewState', 'ready')
      console.log('The pull request has no changes requested and has been approved by at least one required user.')
    } else {
      core.setOutput('reviewState', 'ready')
      console.log('The pull request has changes requested or has not been approved by any required user.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
