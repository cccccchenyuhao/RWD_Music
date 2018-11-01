# 响应式全屏音乐播放器

[预览地址](https://github.com/cccccchenyuhao/RWD_Music)

功能分析：

1. 响应式
   使用 vh 长度单位，页面跟随屏幕高度自适应

2. 事件解耦
   定义一个事件中心
   ```javascript
   var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    	},
    fire: function (type, data) {
        $(document).trigger(type, data)
    	}
   }
   ```
   主页面分为2块：播放区域、频道选择

   选择频道获取频道歌曲列表，发送事件及频道 ID给播放区域

   播放区域捕获事件，根据频道 ID 发送请求获取歌曲并渲染页面

3. 底部滚动动画实现
  把频道列表设为绝对定位
   通过 wrap 和 li 的宽度判断是否滚动到结束`isToEnd`及是否处于头部`isToStart`
   用`animate`给`left`赋值实现滚动

   ```javascript
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
   ```

4. 播放时间及进度条实现
   父子2个 div 实现滚动条，父元素宽度固定(vh随页面高度)，子元素百分比宽度
   通过 audio 的 `currentTime` 和 `duration`计算得到百分比设置布局。
   换算成时间设置播放时间
   ```
       updateTime: function () {
        var min = Math.floor(this.audio.currentTime / 60)
        var sec = Math.floor(this.audio.currentTime % 60) + ''
        sec = sec.length === 2 ? sec : '0' + sec
        $('#curr').text(min + ':' + sec)
        var percent = Math.floor(this.audio.currentTime / this.audio.duration * 100)
        $('.progress').css('width', percent + '%')
    }
   ```
 5. 歌词实现
    通过 AJAX 请求获得的歌词数据为换行分割的一个长字符串
    通过正则表达式及数组方法转化为对象`{00.00: "我是歌词" }`的形式
    通过 audio 的 currentTime 计算获取当前时间对应的歌词 
    使用 settimeInterval 把歌词通过 DOM 操作放入页面
    ```javascript
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
    ```

 

