/**
 * Debugging apps with PhoneGap Developer App is difficult because
 * chrome://inspect for Android and Safari Web Inspector for iOS
 * don't work with apps from the store.
 * 
 * This file adds an window.onerror hook to notify you of errors.
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
*/
window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();

    var substring = "script error";
    // TODO when does this happen?
    if (string.indexOf(substring) > -1){
        alert('Script Error: See Browser Console for Detail');
    } else {

        var console_message = [
            msg,
            // just show the filename for the url
            'File: ' + url.substring(url.lastIndexOf('/')+1),
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error, null, 2)
        ];

        console.log('\n***** JavaScript Error *****\n' + console_message.join('\n'));
    
        // just show the filename part of the sourceURL
        if (error.sourceURL) {
            var sourceURL = error.sourceURL;
            error.file = sourceURL.substring(sourceURL.lastIndexOf('/')+1);
            delete error.sourceURL;
        }

        // format a message for the alert
        var message = 
            url.substring(url.lastIndexOf('/')+1) + ' ' +
            'Line: ' + lineNo + ' ' + 
            'Column: ' + columnNo + '\n\n' +
            msg + '\n\n' +  
            'Error object: ' + JSON.stringify(error, null, 2) + '\n\n';

        navigator.notification.alert(
            message,
            null,
            'JavaScript Error'
        );
    }

    return false;
};
