var ACCESS_TOKEN = 'EDUPRpVbfuSz6y7CJh_o3jK6l_avNEDrqPQyuxpBnTnlsaD72z14j2Rfcn-O9fnLCZO3YzunXo56OC30u9Hht9sCzRakJ9Nkclba67djYJakNaFCEdPmLoNjvjopk7aVPMNiAEAZWX';
var jsapi_ticket = 'kgt8ON7yVITDhtdwci0qeciU0gL6Qd_bmQ9TuL769h0MMOmalxZ0LGLUXvKuxP1R1L6uwcz-Ofzjql3PFBPHeg';
var menuConfig = '{\
                    "button":[\
                        {\
                            "type":"view",\
                            "name":"在线报名",\
                            "url":"http://wwwv.applinzi.com/dist/app/index.php#apply"\
                        },\
                        {\
                            "type":"view",\
                            "name":"在线筛查",\
                            "url":"http://wwwv.applinzi.com/dist/app/index.php#home"\
                        },\
                        {\
                            "name":"需要帮助",\
                            "sub_button":[\
                                {\
                                    "type":"view",\
                                    "name":"激活账号",\
                                    "url":"http://wwwv.applinzi.com/dist/app/index.php#user-active"\
                                },\
                                {\
                                    "type":"view",\
                                    "name":"忘记密码",\
                                    "url":"http://wwwv.applinzi.com/dist/app/index.php#user-forgotpassword"\
                                }]\
                        }]\
                }';
var remoteHost = 'http://wwwv.applinzi.com/dist/app/';
var SESSION = {
  id: null,
  expires: null
};
$(function () {
  $(document).on('click', function (e) {
    var target = $(e.target);
    var router;
    if (target.hasClass('js-router')) {
      router = target.data('router');
      window.pageManager.go(router);
    }
  });

  var pageManager = {
    $container: $('#container'),
    loginUrl: remoteHost + 'checkLogin.php',
    deffered: {
      success: null,
      fail: null,
      then: function (successFn, failFn) {
        pageManager.deffered.success = successFn;
        pageManager.deffered.fail = failFn;
      },
    },
    _pageStack: [],
    _configs: [],
    _pageAppend: function () {
    },
    _defaultPage: null,
    _pageIndex: 1,
    setDefault: function (defaultPage) {
      this._defaultPage = this._find('name', defaultPage);
      return this;
    },
    setPageAppend: function (pageAppend) {
      this._pageAppend = pageAppend;
      return this;
    },
    init: function () {
      var self = this;

      $(window).on('hashchange', function () {
        var state = history.state || {};
        var url = location.hash.indexOf('#') === 0 ? location.hash.replace(/\?(.*)$/, '') : '#';
        var page = self._find('url', url) || self._defaultPage;
        if (state._pageIndex <= self._pageIndex || self._findInStack(url)) {
          self._back(page);
        } else {
          self._go(page);
        }
      });

      if (history.state && history.state._pageIndex) {
        this._pageIndex = history.state._pageIndex;
      }

      this._pageIndex--;

      var url = location.hash.indexOf('#') === 0 ? location.hash.replace(/\?(.*)$/, '') : '#';
      var page = self._find('url', url) || self._defaultPage;
      this._go(page);
      return this;
    },
    showTooltip: function (msg) {
      var $tooltips = $('.js_tooltips');
      if ($tooltips.css('display') != 'none') return;
      // toptips的fixed, 如果有`animation`, `position: fixed`不生效
      $('.page.cell').removeClass('slideIn');

      $tooltips.css('display', 'block');
      setTimeout(function () {
        $tooltips.css('display', 'none');
      }, 2000);
    },
    push: function (config) {
      this._configs.push(config);
      return this;
    },
    ajaxManager: function (cfg) {
      return function (e) {
        var postData = {};
        $.ajax({
          url: cfg.url,
          type: cfg.type || 'post',
          data: cfg.data || $('.weui-cells_form form').serializeArray().forEach(function (v) {
            postData[v.name] = v.value
          }),
          dataType: cfg.dataType || 'json',
          success: cfg.success,
          error: cfg.fail
        });
      }
    },
    getCookie: function (key) {
      var reg = /([^=]*)=([^=]*)(?:;|$)/g;
      var result = document.cookie.match(reg);
      var obj = {};
      if (result) {
        result.forEach(function (v) {
          var d = reg.exec(v);
          var key = d[1];
          var value = d[2];
          obj[key] = value;
        });
      }
      return obj[key];
    },
    setCookie: function (key, value) {
      document.cookie = key + '=' + value;
    },
    checkLogin: function (checkType) {
      var self = this;
      if (checkType === 'remote') {
        var config = {
          url: this.loginUrl,
          type: 'get',
          data: {
            openID: '',
            phoneNum: self.getCookie('phoneNum')
          },
          success: function (res) {
            self.deffered.success(res);
          },
          fail: function (ex) {
            self.deffered.fail(ex);
          }
        };
        setTimeout(function () {
          self.ajaxManager(config);
        }, 0);
      }
      if (checkType === 'local') {
        var cookie = document.cookie;
        if (/SESSION/.test(cookie)) {
          self.deffered.success({login: 'logged'});
        } else {
          self.deffered.fail(ex);
        }
      }
      return this.deffered;
    },
    go: function (to) {
      var config = this._find('name', to);
      if (!config) {
        return;
      }
      if (to === 'home') {//需要登陆验证的页面
        this.checkLogin('remote').then(
          //success
          function (res) {
            if (res.login === 'logged') {
              location.hash = config.url;
            } else {
              location.hash = 'login';
            }
          },
          //fail
          function (ex) {
          }
        );
      } else {
        location.hash = config.url;
      }
    },
    _go: function (config) {
      this._pageIndex++;

      history.replaceState && history.replaceState({_pageIndex: this._pageIndex}, '', location.href);

      var html = $(config.template).html();
      var $html = $(html).addClass('slideIn').addClass(config.name);
      $html.on('animationend webkitAnimationEnd', function () {
        $html.removeClass('slideIn').addClass('js_show');
      });
      this.$container.append($html);
      this._pageAppend.call(this, $html);
      this._pageStack.push({
        config: config,
        dom: $html
      });

      if (!config.isBind) {
        this._bind(config);
      }

      return this;
    },
    back: function () {
      history.back();
    },
    _back: function (config) {
      this._pageIndex--;

      var stack = this._pageStack.pop();
      if (!stack) {
        return;
      }

      var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
      var found = this._findInStack(url);
      if (!found) {
        var html = $(config.template).html();
        var $html = $(html).addClass('js_show').addClass(config.name);
        $html.insertBefore(stack.dom);

        if (!config.isBind) {
          this._bind(config);
        }

        this._pageStack.push({
          config: config,
          dom: $html
        });
      }

      stack.dom.addClass('slideOut').on('animationend webkitAnimationEnd', function () {
        stack.dom.remove();
      });

      return this;
    },
    _findInStack: function (url) {
      var found = null;
      for (var i = 0, len = this._pageStack.length; i < len; i++) {
        var stack = this._pageStack[i];
        if (stack.config.url === url) {
          found = stack;
          break;
        }
      }
      return found;
    },
    _find: function (key, value) {
      var page = null;
      for (var i = 0, len = this._configs.length; i < len; i++) {
        if (this._configs[i][key] === value) {
          page = this._configs[i];
          break;
        }
      }
      return page;
    },
    _bind: function (page) {
      var events = page.events || {};
      for (var t in events) {
        for (var type in events[t]) {
          this.$container.on(type, t, events[t][type]);
        }
      }
      page.isBind = true;
    }
  };

  function fastClick() {
    var supportTouch = function () {
      try {
        document.createEvent("TouchEvent");
        return true;
      } catch (e) {
        return false;
      }
    }();
    var _old$On = $.fn.on;

    $.fn.on = function () {
      if (/click/.test(arguments[0]) && typeof arguments[1] == 'function' && supportTouch) { // 只扩展支持touch的当前元素的click事件
        var touchStartY, callback = arguments[1];
        _old$On.apply(this, ['touchstart', function (e) {
          touchStartY = e.changedTouches[0].clientY;
        }]);
        _old$On.apply(this, ['touchend', function (e) {
          if (Math.abs(e.changedTouches[0].clientY - touchStartY) > 10) return;

          e.preventDefault();
          callback.apply(this, [e]);
        }]);
      } else {
        _old$On.apply(this, arguments);
      }
      return this;
    };
  }

  function preload() {
    $(window).on("load", function () {
      var imgList = [
        "./images/layers/content.png",
        "./images/layers/navigation.png",
        "./images/layers/popout.png",
        "./images/layers/transparent.gif"
      ];
      for (var i = 0, len = imgList.length; i < len; ++i) {
        new Image().src = imgList[i];
      }
    });
  }

  function androidInputBugFix() {
    // .container 设置了 overflow 属性, 导致 Android 手机下输入框获取焦点时, 输入法挡住输入框的 bug
    // 相关 issue: https://github.com/weui/weui/issues/15
    // 解决方法:
    // 0. .container 去掉 overflow 属性, 但此 demo 下会引发别的问题
    // 1. 参考 http://stackoverflow.com/questions/23757345/android-does-not-correctly-scroll-on-input-focus-if-not-body-element
    //    Android 手机下, input 或 textarea 元素聚焦时, 主动滚一把
    if (/Android/gi.test(navigator.userAgent)) {
      window.addEventListener('resize', function () {
        if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
          window.setTimeout(function () {
            document.activeElement.scrollIntoViewIfNeeded();
          }, 0);
        }
      })
    }
  }

  function setJSAPI() {
    var option = {
      title: '博奥颐和健康管理',
      desc: '博奥颐和健康管理',
      link: remoteHost,
      imgUrl: '#'
    };
    res = {
      "nonceStr": "o01nvjrr2ismsmh",
      "timestamp": "1481794042",
      "url": remoteHost,
      "signature": jsapi_ticket,
      "appid": "wx7883f3fde466515d"
    };
    // $.getJSON('https://weui.io/api/sign?url=' + encodeURIComponent(location.href.split('#')[0]), function (res) {
    wx.config({
      beta: true,
      debug: false,
      appId: res.appid,
      timestamp: res.timestamp,
      nonceStr: res.nonceStr,
      signature: res.signature,
      jsApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        'startRecord',
        'stopRecord',
        'onVoiceRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'onVoicePlayEnd',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'translateVoice',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
      ]
    });
    wx.ready(function () {

      wx.invoke('setNavigationBarColor', {
        color: 'red'
      });

      wx.invoke('setBounceBackground', {
        'backgroundColor': '#F8F8F8',
        'footerBounceColor': '#F8F8F8'
      });
      wx.onMenuShareTimeline(option);
      wx.onMenuShareQQ(option);
      wx.onMenuShareAppMessage({
        title: '博奥颐和健康管理',
        desc: '健康管理平台',
        link: location.href,
        imgUrl: '#'
      });

      getMenu();
    });

    function getMenu() {
      $.ajax({
        url: 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + ACCESS_TOKEN,
        type: 'post',
        data: {
          body: encodeURIComponent(menuConfig)
        },
        success: function (res) {
          console.log(res)
        },
        error: function (ex) {
          console.log(ex);
        }
      });
    }

    // });
  }

  function setPageManager() {
    var pages = {}, tpls = $('script[type="text/html"]');
    var winH = $(window).height();

    for (var i = 0, len = tpls.length; i < len; ++i) {
      var tpl = tpls[i], name = tpl.id.replace(/tpl_/, '');
      pages[name] = {
        name: name,
        url: '#' + name,
        template: '#' + tpl.id
      };
    }
    pages.home.url = '#';

    for (var page in pages) {
      pageManager.push(pages[page]);
    }
    pageManager
      .setPageAppend(function ($html) {
        var $foot = $html.find('.page__ft');
        if ($foot.length < 1) return;

        if ($foot.position().top + $foot.height() < winH) {
          $foot.addClass('j_bottom');
        } else {
          $foot.removeClass('j_bottom');
        }
      })
      .setDefault('home')
      .init();
  }


  function init() {
    preload();
    fastClick();
    androidInputBugFix();
    setJSAPI();
    setPageManager();

    window.pageManager = pageManager;
    window.home = function () {
      location.hash = '';
    };
    $('div').last().children('a').click();
  }

  init();
  function nation1() {
    var national = [
      "汉族", "壮族", "满族", "回族", "苗族", "维吾尔族", "土家族", "彝族", "蒙古族", "藏族", "布依族", "侗族", "瑶族", "朝鲜族", "白族", "哈尼族",
      "哈萨克族", "黎族", "傣族", "畲族", "傈僳族", "仡佬族", "东乡族", "高山族", "拉祜族", "水族", "佤族", "纳西族", "羌族", "土族", "仫佬族", "锡伯族",
      "柯尔克孜族", "达斡尔族", "景颇族", "毛南族", "撒拉族", "布朗族", "塔吉克族", "阿昌族", "普米族", "鄂温克族", "怒族", "京族", "基诺族", "德昂族", "保安族",
      "俄罗斯族", "裕固族", "乌孜别克族", "门巴族", "鄂伦春族", "独龙族", "塔塔尔族", "赫哲族", "珞巴族"
    ];
    var nat = document.getElementById("national");
    for (var i = 0; i < national.length; i++) {
      var option = document.createElement('option');
      option.value = i;
      var txt = document.createTextNode(national[i]);
      option.appendChild(txt);
      nat.appendChild(option);
    }
  }

  window.nation1 = nation1;

  $('body').append('<div id="hashMaps" style="position: fixed; z-index: 9999; right: 10px; bottom: 10px; background: #fff; opacity: 0.5; min-width:100px;height:200px; overflow: scroll"><b id="closeThis" onclick="$(\'#hashMaps\').hide()" style="position:absolute;right:0px;top:0px;">X</b></div>');
  $('[id*=tpl_]').each(function (i, e) {
    var hash = $(e).attr('id').replace('tpl_', '');
    $('#hashMaps').append('<a href="#' + hash + '">' + hash + '</a><br>');
  });

});




