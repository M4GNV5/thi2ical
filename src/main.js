var http = require("http");
var url = require("url");
var querystring = require("querystring");
var ical = require("ical-generator");
var thi = require("./thi.js");

var config = require("./../config.json");
exports.useragent = config.useragent;

http.createServer(function(req, res)
{
	res.statuscode = 500;
	if(config.domain + req.url != config.url)
		return res.end("Invalid access");

	thi.login(config.username, config.password, function(err, session)
	{
		if(err)
			return res.end("Error: " + err);

		thi.timetable(session, new Date(), function(err, timetable)
		{
			if(err)
				return res.end("Error: " + err);

			var cal = ical({domain: config.domain, url: config.url, name: config.name, ttl: config.ttl});
			timetable.forEach(function(curr)
			{
				cal.addEvent({
					start: curr.datum + " " + curr.von,
					end: curr.datum + " " + curr.bis,
					summary: curr.veranstaltung.split(" ")[0] + " " + curr.raum,
					description: curr.fach + " bei " + curr.dozent + " in " + curr.raum,
				});
			});

			res.statuscode = 200;
			cal.serve(res);
		});
	});
}).listen(8080);
