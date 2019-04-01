import { assert } from 'chai';

async function assertRestStatus(func, expectedRestStatus, expectedStatusText) {
  let result
  try {
    result = await func()
  } catch (err) {
    assert.isDefined(err.response, 'err.response undefined - not a rest error')
    const restStatus = err.response.status
    assert.equal(restStatus, expectedRestStatus, 'expected rest status error')
    if (expectedStatusText) {
      const restStatusText = err.response.statusText
      assert.equal(restStatusText, expectedStatusText, 'expected rest status error')
    }
    return
  }
  assert.isUndefined(result, `No REST ERROR found related to: ${expectedRestStatus}`)
}

export {
  assertRestStatus
}