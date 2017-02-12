import relogin from '../application/relogin';

export default async function enforceLogin(request, response) {
    const {loginId} = request.cookies;

    if (!loginId) {
        sendLoginFailed(response);
        return;
    }

    const reloginResult = await relogin(loginId);

    let result;

    if (!reloginResult.isValid)
        result = sendLoginFailed(response);
    else
        result = reloginResult;

    request.appSession = result;
    return result;
}

function sendLoginFailed(response) {
    response.status(403);

    response.json({
        status: 'Must be logged in for using this call.'
    });
}
