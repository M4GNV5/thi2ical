var querystring = require("querystring");
var request = require("request");

function makeRequest(data, cb)
{
	var options = {
		uri: "https://hiplan.thi.de/webservice/production/index.php",
		method: "POST",
		headers: {
			"Content-type": "application/x-www-form-urlencoded",
			"User-Agent": exports.useragent
		},
		body: querystring.stringify(data)
	};
	request(options, cb);
}

exports.useragent = "thi2ical 0.0.0 +https://github.com/M4GNV5/thi2ical";

exports.login = function(username, pw, cb)
{
	makeRequest({
		service: "session",
		method: "open",
		format: "json",
		username: username,
		passwd: pw
	}, function(err, resp, body)
	{
		if(err)
			return cb(err);

		var session;
		try
		{
			var data = JSON.parse(body);
			if(data.status !== 0 || typeof data.data[0] != "string")
				throw "THI Api error " + body.status;

			session = data.data[0];
		}
		catch(e)
		{
			cb(e);
			return;
		}

		cb(false, session);
	});
}

exports.timetable = function(session, date, cb)
{
	makeRequest({
		service: "thiapp",
		method: "stpl",
		format: "json",
		session: session,
		day: date.getDate(),
		month: date.getMonth() + 1,
		year: date.getFullYear(),
		details: 0
	}, function(err, resp, body)
	{
		if(err)
			return cb(err);

		var timetable;
		try
		{
			var data = JSON.parse(body);
			if(data.status !== 0 || !Array.isArray(data.data[3]))
				throw "THI Api error " + body.status;

			timetable = data.data[3];
		}
		catch(e)
		{
			cb(e);
			return;
		}

		cb(false, timetable);
	});
}
