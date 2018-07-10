var util = require('../../utils/util.js');
Page({

  data: {
    date: '',
    city: '',
    local: '',
    weather: [],
    searchInput: '',
    showClear: 'none',
  },

  onLoad: function () {
    //获取当前时间对象
    var time = new Date();
    // 获取日期和星期数并赋予date
    this.setData({
      date: util.formatTime(time).split(' ')[0] + ' ' + this.weekdayFormat(time.getDay()),
      version: wx.getStorageSync('version'),
    });
    // 传递对象
    var that = this;
    // 版本检查
    if (this.data.version !== '1.1.0') {
      // 显示弹窗
      wx.showModal({
        title: '1.1.0 更新内容',
        content: '2018年07月10日\n\n❤ 优化代码。\n\n❤ 当前时间显示周几了！',
        confirmText: '我知道了',
        showCancel: false,
      })
      // 设置版本号
      wx.setStorageSync('version', '1.1.0')
    }

    // 获取当前经纬度
    wx.getLocation({
      success: function (res) {
        // 显示加载提示框
        wx.showToast({
          title: '正在加载...',
          icon: 'loading',
          duration: 2000000,
        })
        //保存经纬度
        var latitude = res.latitude;
        var longitude = res.longitude;

        // 通过经纬度获取天气数据
        wx.request({
          url: 'https://ali-weather.showapi.com/gps-to-weather?from=1&lat=' + latitude + '&lng=' + longitude + '&needIndex=1&needMoreDay=1',
          data: {},
          header: {
            'Authorization': 'APPCODE eb40edc07d25455496995febb87b007e'
          },
          success: function (res) {
            // 隐藏提示框
            wx.hideToast();
            // 将返回的数据保存
            var weather = res.data.showapi_res_body;
            // 通过weekdayFormat函数处理星期数
            weather.f4.weekday = that.weekdayFormat(weather.f4.weekday)
            // 设置全局变量
            that.setData({
              weather: weather,
              city: res.data.showapi_res_body.cityInfo.c3,
              local: res.data.showapi_res_body.cityInfo.c3,
            })
          },
          // 请求失败处理
          fail: function () {
            wx.hideToast()
            wx.showModal({
              title: '网络超时',
              content: '连接服务器失败,请检查网络设置！',
              showCancel: false,
            })
          }
        })
      },
      // 请求失败处理
      fail: function () {
        wx.hideToast()
        wx.showModal({
          title: '定位失败',
          content: '获取不到本地天气了呢！',
          showCancel: false,
        })
      }
    })
  },

  // 通过城市查询天气
  weatherSearch: function (city) {
    // 显示加载提示框
    wx.showToast({
      title: '正在加载...',
      icon: 'loading',
      duration: 2000000,
    })
    // 传递对象
    var that = this;
    // 通过城市名获取天气数据
    wx.request({
      url: 'https://ali-weather.showapi.com/area-to-weather?area=' + city + '&needIndex=1&needMoreDay=1',
      header: {
        'Authorization': 'APPCODE eb40edc07d25455496995febb87b007e'
      },
      success: function (res) {
        // 隐藏提示框
        wx.hideToast();
        // 是否返回成功
        if (res.data.showapi_res_body.ret_code == 0) {
          // 将返回的数据保存
          var weather = res.data.showapi_res_body;
          // 通过weekdayFormat函数处理星期数
          weather.f4.weekday = that.weekdayFormat(weather.f4.weekday)
          // 设置全局变量
          that.setData({
            weather: weather
          })
        }
        else {
          wx.hideToast()
          wx.showModal({
            title: '查询失败',
            content: '输入的城市名称有误，请重新输入！',
            showCancel: false,
          })
        }
      },
      fail: function () {
        wx.hideToast()
        wx.showModal({
          title: '网络超时',
          content: '当前网络不可用,请检查网络设置！',
          showCancel: false,
        })
      }
    })
  },

  // 输入地址查询天气
  inputWeatherSearch: function (e) {
    // 设置全局变量
    this.setData({ city: e.detail.value });
    // 是否输入文字
    if (e.detail.value.length > 0) {
      // 显示输入框一键清除按钮
      this.setData({
        showClear: 'block',
      })
    }
    else {
      // 显示输入框一键清除按钮
      this.setData({
        showClear: 'none',
      })
    }
  },

  // 点击搜索按钮搜索天气
  btnWeatherSearch: function () {
    // 调用搜索函数
    this.weatherSearch(this.data.city);
    //显示提示框
    wx.showToast({
      title: '正在查询...',
      icon: 'loading',
      duration: 2000000,
    })
  },

  // 清除输入框内容
  clearInput: function (e) {
    this.setData({
      searchInput: '',
      showClear: 'none',
    })
  },

  // 刷新
  refresh: function () {
    this.weatherSearch(this.data.city);
  },

  // 查询本地
  local: function () {
    this.weatherSearch(this.data.local);
    this.clearInput();
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.weatherSearch(this.data.city);
    wx.stopPullDownRefresh();
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '轻松天气',
      desc: '以清新简洁为界面主题的天气查询小程序',
      path: '/pages/index/index'
    }
  },

  // 格式化星期数的函数
  weekdayFormat: function (weekday) {
    switch (weekday) {
      case 1:
        weekday = "周一";
        break;
      case 2:
        weekday = "周二";
        break;
      case 3:
        weekday = "周三";
        break;
      case 4:
        weekday = "周四";
        break;
      case 5:
        weekday = "周五";
        break;
      case 6:
        weekday = "周六";
        break;
      case 7:
        weekday = "周日";
        break;
    }
    // 返回修改后的天气数据
    return weekday;
  }
})