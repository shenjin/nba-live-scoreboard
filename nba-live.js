var nbaLive = {
    dataHost: 'http://data.nba.com',
    statsHost: 'http://stats.nba.com',
    calFeed: '/jsonp/1h/json/cms/noseason/schedule/calendar_easy.json',
    scoreboard: '/jsonp/5s/json/cms/noseason/scoreboard/{0}/games.json',
    imgDir: 'http://z.cdn.turner.com/nba/nba/.element/img/4.0/global/logos/512x512/bg.white/',
    boxScore: '/stats/boxscorescoring?GameID={0}&StartPeriod=0&EndPeriod=0&StartRange=0&EndRange=0&RangeType=0',
    dateAccessed: 0,
    games: [],
    gamePadding: 10,
    calendar: {},
    interval: null,
    team1: {
        name: '',
        teamStats: []
    },
    team2: {
        name: '',
        teamStats: []
    },
    errorHandler: function (e) {
        console.error('error');
        console.error(e);
    },
    init: function () {
        $.ajax(this.dataHost + this.calFeed, {
            type: 'GET',
            cache: true,
            dataType: 'jsonp',
            jsonpCallback: 'nbaLive.fetchGameDays',
            error: 'nbaLive.errorHandler'
        });
    },
    fetchGameDays: function (data) {
        this.dateAccessed = parseInt(data.sports_content.sports_meta.season_meta.calendar_date);
        this.calendar = data.sports_content.calendar;
        this.getPrevGames(1);
        this.getNextGames(5);

        for (var game in this.games) {
            if (this.games[game] == this.dateAccessed) {
                var date = this.games[game];
                this.interval = setInterval(function() {
                    nbaLive.fetchDay(date, 'nbaLive.fetchGamesRefresh');
                }, 8000);
            }
            this.fetchDay(this.games[game], 'nbaLive.fetchGames');
        }

    },
    fetchDay: function(game, func) {
        $.ajax(this.dataHost + this.scoreboard.replace(/\{0\}/g, game), {
            type: 'GET',
            cache: true,
            dataType: 'jsonp',
            jsonpCallback: func,
            error: 'nbaLive.errorHandler'
        });
    },
    getPrevGames: function (n) {
        for (var i = this.dateAccessed - 1; i >= this.dateAccessed - this.gamePadding; i--) {
            if (this.calendar[i]) {
                this.games.push(i);
                n -= 1;
                if (n === 0) {
                    break;
                }
            }
        }
    },
    getNextGames: function (n) {
        for (var i = this.dateAccessed; i < this.dateAccessed + this.gamePadding; i++) {
            if (this.calendar[i]) {
                this.games.push(i);
                n -= 1;
                if (n === 0) {
                    break;
                }
            }
        }
    },
    fetchGamesRefresh: function (data) {
        var games = data.sports_content.games.game;
        if (games.length > 0) {
            nbaRender.updateScoreboards(games);
            this.getBoxScore(games[0].date, nbaRender.activeID, null);
        }
    },
    fetchGames: function (data) {
        var games = data.sports_content.games.game;
        if (games.length > 0) {
            nbaRender.renderScoreboards(games, this.imgDir, this.dateAccessed, false);
            nbaRender.sortScoreboards();
        }
    },
    getBoxScore: function (date, gameID, activeID) {
        $.get('http://nba-scoreboard-fetch.appspot.com/', {date: date, gameID: gameID}, function (data) {
            if(activeID !== null) {
                nbaRender.scrollToActive(activeID);
            }
            nbaRender.remove('#nbaLiveBoxscore .container .row');
            $('#nbaLiveBoxscore .container .row').html(data);
            nbaRender.editScoreboard();
        });
    }

};