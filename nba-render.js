var nbaRender = {
    activeID: null,
    activeSet: false,
    panels: {
        panel: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        panel0: [
            [1, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [1, 1, 1, 1]
        ],
        panel1: [
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1]
        ],
        panel2: [
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1],
            [1, 0, 0, 0],
            [1, 1, 1, 1]
        ],
        panel3: [
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1],
        ],
        panel4: [
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1]
        ],
        panel5: [
            [1, 1, 1, 1],
            [1, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1]
        ],
        panel6: [
            [1, 1, 1, 1],
            [1, 0, 0, 0],
            [1, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 1, 1, 1]
        ],
        panel7: [
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1]
        ],
        panel8: [
            [1, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 1, 1, 1]
        ],
        panel9: [
            [1, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1]
        ],
    },
    sortScoreboards: function () {
        d3.select('body').selectAll('div.board-group')
            .sort(function (a, b) {
                return a.id < b.id ? -1 : 1;
            })
            .transition()
            .duration(500);
    },
    scrollToActive: function (gameID) {
        $('.active').removeClass('active');
        var container = d3.select('.container');
        var active_game = d3.select('.board-group .board-' + gameID);
        $('.board-group .board-' + gameID).addClass('active');
        nbaRender.activeID = gameID;
        var offsetLeft = active_game[0][0].offsetLeft;
        offsetLeft -= parseInt(active_game.style('margin-left'));
        d3.select('.board-view')
            .transition()
            .duration(2000)
            .tween("scroll", scrollToLeft(offsetLeft));

        function scrollToLeft(scrollLeft) {
            return function () {
                var i = d3.interpolateNumber(this.scrollLeft, scrollLeft);
                return function (t) {
                    this.scrollLeft = i(t);
                };
            };
        }
    },
    updateScoreboards: function(data) {
        var panels = this.panels;
        var $nbaLiveScoreboard = d3.select('#nbaLiveScoreboard .container .row .board-view .board-full');

        var test = $nbaLiveScoreboard.selectAll('.board-group-' + data[0].date)
            .data(data)
            .select('.boards')
            .selectAll('.nba-team').data(function(d) { return [d.visitor, d.home]})
            .select('.panels')
            .selectAll('.panel-display').data(function (d) {
                var digits = d.score.split('');
                while (digits.length !== 3) {
                    digits.unshift('');
                }
                return digits;
            })
            .attr('class', function (d) {
                return 'panel-display ' + 'panel-' + d;
            })
            .selectAll('.circle-row').data(function (d) {
                return panels['panel' + d];
            })
            .selectAll('.circle')
            .data(function (d) {
                return d;
            })
            .attr('class', function(d) {
                return 'circle circle-' + d;
            });
    },
    renderScoreboards: function (data, imgDir, date, refresh) {
        var panels = this.panels;
        var $nbaLiveScoreboard = d3.select('#nbaLiveScoreboard .container .row .board-view .board-full');

        $nbaLiveScoreboard.selectAll('.board-group-' + data[0].date)
            .data(data)
            .enter()
            .append('div')
            .attr('class', 'board-group board-group-' + data[0].date)
            .append('div')
            .attr('class', function (d, i) {
                var ret = 'boards boards-' + d.date + ' board-' + d.id;
                if (parseInt(d.date) === date && !nbaRender.activeSet && d.period_time.period_status !== 'Final') {
                    ret += ' active';
                    nbaRender.activeSet = true;
                    nbaRender.activeID = d.id;
                    nbaLive.getBoxScore(d.date, d.id, d.id);
                }
                return ret;
            })
            .on('click', function (d) {
                nbaLive.getBoxScore(d.date, d.id, d.id);
            })
            .selectAll('.nba-team')
            .data(function (d) {
                return [d.visitor, d.home];
            })
            .enter()
            .append('div')
            .attr('class', function (d, i) {
                return 'nba-team nba-team-' + i + ' team-' + d.team_key;
            })
            .append('div')
            .attr('class', 'panels')
            .selectAll('.panel-display')
            .data(function (d) {
                var digits = d.score.split('');
                while (digits.length !== 3) {
                    digits.unshift('');
                }
                return digits;
            })
            .enter()
            .append('div')
            .attr('class', function (d) {
                return 'panel-display ' + 'panel-' + d;
            })
            .selectAll('.circle-row')
            .data(function (d) {
                return panels['panel' + d];
            })
            .enter()
            .append('div')
            .attr('class', function (d, i) {
                return 'circle-row circle-row-' + i;
            })
            .selectAll('.circle')
            .data(function (d) {
                return d;
            })
            .enter()
            .append('div')
            .attr('class', function (d) {
                return 'circle circle-' + d;
            });

        if (!refresh) {
            $nbaLiveScoreboard.selectAll('.boards-' + data[0].date + ' .nba-team')
                .append('div')
                .attr('class', function (d) {
                    return 'team-name';
                });


            $nbaLiveScoreboard.selectAll('.boards-' + data[0].date + ' .nba-team .team-name')
                .append('img')
                .attr('src', function (d) {
                    return imgDir + '/svg/' + d.abbreviation + '.svg';
                });

            $nbaLiveScoreboard.selectAll('.boards-' + data[0].date + ' .nba-team .team-name')
                .append('div')
                .append('text')
                .text(function (d) {
                    return d.abbreviation;
                });
        }
    },
    renderBoxScore: function (data) {

        var $boxscore = d3.select('#nbaLiveBoxscore .container .row');

        $boxscore
            .append('div')
            .attr('class', 'box-score box-score-' + data.name + 'col-sm-12 col-md-12 col-lg-12 col-xl-6')
            .append('table')
            .selectAll('tr')
            .data(data.teamStats)
            .enter()
            .append('tr')
            .selectAll('td')
            .data(function (d) {
                return d;
            })
            .enter()
            .append('td')
            .text(function (d) {
                return d;
            });
    },
    remove: function (parent) {
        d3.select(parent).selectAll('*').remove();
    },
    editScoreboard: function () {
        var tables = d3.select('#nbaLiveBoxscore .container').selectAll('.nbaGIBoxCat').remove();
        var names = d3.select('#nbaLiveBoxscore .container').selectAll('#nbaGIBoxNme a');

        names[0].map(function(d) {
            $(d).replaceWith('<text class="nbaNames">' + d.innerHTML + '</text>');
        });
    }
};