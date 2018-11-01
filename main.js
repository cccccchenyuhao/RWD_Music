var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    },
    fire: function (type, data) {
        $(document).trigger(type, data)
    }
}

var Footer = {
    init: function () {
        this.$footer = $('footer')
        this.isToStart = true
        this.isToEnd = false
        this.bind()
        this.getData()
    },
    bind: function () {
        var _this = this
        $('footer').hover(function () {
            $('footer i').addClass('active')
        }, function () {
            $('footer i').removeClass('active')
        })

        $(window).resize(function () {
            _this.setStyle()
        })
        $('.next').click(function () {
            var count = Math.floor($('footer .wrap').width() / $('li').outerWidth(true))
            var rowWidth = $('li').outerWidth(true)
            if (parseFloat(count * rowWidth) - parseFloat($('ul').css('left')) >= parseFloat($('ul').css('width'))) {
                _this.isToEnd = true
            } else {
                _this.isToEnd = false
            }
            if (!_this.isToEnd) {
                $('ul').animate({
                    left: '-=' + count * rowWidth
                }, 400)
            }
        })
        $('.prev').click(function () {
            var count = Math.floor($('footer .wrap').width() / $('li').outerWidth(true))
            var rowWidth = $('li').outerWidth(true)
            if (parseFloat($('ul').css('left')) < 0) {
                $('ul').animate({
                    left: '+=' + count * rowWidth
                }, 400)
            }
        })
        $('footer').on('click', "li", function () {
            $(this).addClass('active').siblings().removeClass('active')
            EventCenter.fire('typeSelected', {
                channelId: $(this).attr('data-chanel-id'),
                channelName: $(this).attr('data-chanel-name')
            })
        })
    },
    getData: function () {
        var _this = this
        $.ajax({
            url: 'http://api.jirengu.com/fm/getChannels.php',
            method: 'GET',
        }).done(function (data) {
            _this.renderFooter(JSON.parse(data))
        }).fail(function () {
            console.log('err')
        })
    },
    renderFooter: function (data) {
        var str = ''
        data.channels.forEach(function (channel) {
            str += `
            <li class="cover" data-chanel-id=${channel.channel_id} data-chanel-name=${channel.name}>
                <div style="background-image:url(${channel.cover_small})"></div>
                <h3>${channel.name}</h3>
            </li>
            `
        })
        $('footer ul').html(str)
        this.setStyle()
    },
    setStyle: function () {
        var count = this.$footer.find('li').length
        var width = this.$footer.find('li').outerWidth(true)
        this.$footer.find('ul').css({
            width: count * width + 'px'
        })
    }
}

var FM = {
    init: function () {
        this.$ct = $('#page-music')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.bind()
    },
    bind: function () {
        var _this = this
        EventCenter.on('typeSelected', function (e, obj) {
            _this.channelId = obj.channelId
            _this.channelName = obj.channelName
            _this.loadMusic()
            $('.btn-play').removeClass('icon-play').addClass('icon-pause')
        })
        $('.btn-play').click(function () {
            if ($(this).hasClass('icon-play')) {
                $(this).removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
            } else {
                $(this).addClass('icon-play').removeClass('icon-pause')
                _this.audio.pause()
            }
        })
        $('.btn-next').click(function () {
            _this.loadMusic()
        })
        $('.progress-bar').click(function (e) {
            var rate = e.offsetX / $('.progress-bar').width()
            _this.audio.currentTime = _this.audio.duration * rate
        })
        this.audio.addEventListener('play', function () {
            var min = Math.floor(_this.audio.duration / 60)
            var sec = Math.floor(_this.audio.duration % 60) + ''
            sec = sec.length === 2 ? sec : '0' + sec
            $('#total').text(min + ':' + sec)
            clearInterval(_this.clock)
            _this.clock = setInterval(function () {
                _this.setLyric()
                _this.updateTime()
            }, 1000)
        })
        this.audio.addEventListener('pause', function () {
            clearInterval(_this.clock)
        })
    },
    loadMusic: function () {
        var _this = this
        console.log(_this.channelId)
        $.getJSON('https://jirenguapi.applinzi.com/fm/getSong.php', { channel: _this.channelId })
            .done(function (data) {
                _this.setMusic(data['song'][0])
            })
    },
    setMusic: function (song) {
        var _this = this
        this.song = song
        this.audio.src = song.url
        $('.bg').css('background-image', "url(" + song.picture + ")")
        $('.panel .cover').css('background-image', "url(" + song.picture + ")")
        $('.info .sort').text(_this.channelName)
        $('.info .title').text(song.title)
        $('.info .artist').text(song.artist)
        this.loadLyric()
    },
    updateTime: function () {
        var min = Math.floor(this.audio.currentTime / 60)
        var sec = Math.floor(this.audio.currentTime % 60) + ''
        sec = sec.length === 2 ? sec : '0' + sec
        $('#curr').text(min + ':' + sec)
        var percent = Math.floor(this.audio.currentTime / this.audio.duration * 100)
        $('.progress').css('width', percent + '%')
    },
    loadLyric: function () {
        var _this = this
        $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php', { sid: _this.song.sid })
            .done(function (data) {
                var obj = {}
                var lineArr = data.lyric.split('\n')
                lineArr.forEach(function (line) {
                    if (line.match(/\d{2}:\d{2}/g)) {
                        line.match(/\d{2}:\d{2}/g).forEach(function (time) {
                            obj[time] = line.replace(/\[.+?\]/g, '')
                        })
                    }

                })
                _this.obj = obj
            }).fail(function (err) {
                console.log(err);
            })
    },
    setLyric: function () {
        var timeStr = '0' + Math.floor(this.audio.currentTime / 60) + ':'
            + (Math.floor(this.audio.currentTime) % 60 / 100).toFixed(2).substr(2)
            console.log(timeStr,this.obj[timeStr])
        if (this.obj && this.obj[timeStr]) {
            $('.lyric').text(this.obj[timeStr])
        }
    }
}




Footer.init()
FM.init()