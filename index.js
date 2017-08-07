var uploader,
  isImageFormat = true;
$(document).ready(function () {
  _getToken((err, token) => {
    upload(token);
  });
})

function upload(token) {
  console.log("init upload")
  uploader = Qiniu.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: 'pickfiles',
    uptoken: token,
    get_new_uptoken: false,
    domain: 'http://xxxx.clouddn.com',
    container: 'container',
    max_file_size: '5mb',
    max_retries: 3,
    dragdrop: true,
    drop_element: 'container',
    chunk_size: '4mb',
    auto_start: true,
    // filters: {
    //   max_file_size: '10mb',
    //   prevent_duplicates: true,
    //   mime_types: [
    //     { title: "Image files", extensions: "jpg,gif,png,jpeg" },
    //   ]
    // },
    resize: {
      crop: true,
      quality: 20,
      preserve_headers: false
    },
    init: {
      // 文件添加进队列后，处理相关的事情
      'FilesAdded': function (up, files) {
        plupload.each(files, function (file) {
          console.log("FilesAdded", file);
          alert(file.type)
          if (file.type.indexOf("image/") == '-1') {
            console.log("格式出错");
            isImageFormat = false;
          }
        });
      },

      // 每个文件上传前，处理相关的事情
      'BeforeUpload': function (up, file) {
        console.log("BeforeUpload", file);
        if (!isImageFormat) {
          alert("上传图片格式错误,请重新上传！");
          // location.reload();
          uploader.stop();
          isImageFormat = true;
        }

      },

      // 每个文件上传时，处理相关的事情
      'UploadProgress': function (up, file) {
        $('#pickfiles').text("上传中...")
        console.log("UploadProgress", up);
      },

      // 每个文件上传成功后，处理相关的事情
      'FileUploaded': function (up, file, info) {
        // 包括key和hash
        // var info = JSON.parse(info);
        // console.log({ 'info': info });
        // // 由Key()生成的qiniuKey
        // var imageKey = info.key;
        // $('#avatar').css('background-image', "url(http://xxxx.clouddn.com/" + imageKey + ")");
        //判断当前设备
        var u = navigator.userAgent,
          app = navigator.appVersion;
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
        if (isAndroid) {
          var res = JSON.parse(info);
          var sourceLink = "http://ostxdr26m.bkt.clouddn.com/" + "/" + res.key; //获取上传成功后的文件的Url
          sourceLink = "http://" + sourceLink;
          var imgLink = Qiniu.imageView2({
            mode: 3,  // 缩略模式，共6种[0-5]
            w: 60,   // 具体含义由缩略模式决定
            h: 60,   // 具体含义由缩略模式决定
            q: 100,   // 新图的图像质量，取值范围：1-100
            format: 'jpg'  // 新图的输出格式，取值范围：jpg，gif，png，webp等
          }, sourceLink);
          console.log(imgLink);
          var link = imgLink.slice(32);
          console.log(link);

          $('#avatar').css('background-image', "url(http://xxxx.clouddn.com/" + res.key + ")");
        } else {
          var res = JSON.parse(info);
          var sourceLink = "http://xxxx.clouddn.com/" + "/" + res.key; //获取上传成功后的文件的Url
          sourceLink = "http://" + sourceLink;
          $('#avatar').css('background-image', "url(http://xxxx.clouddn.com/" + res.key + ")");
        }
      },

      // 上传出错时，处理相关的事情
      'Error': function (up, err, errTip) {
        console.log("Error", err, errTip);
        if (err.code === -602) {

        }
      },

      // 队列文件处理完毕后，处理相关的事情
      'UploadComplete': function (file) {
        alert("UploadComplete")
        $('#pickfiles').text("上传");
        file.files = [];
        console.log("UploadComplete", file);
      },

      // 前端对每个文件的key进行个性化处理
      'Key': function (up, file) {
        var qiniuKey = file.name + '_' + new Date().getTime();
        return qiniuKey;
      },
    }
  });

}

function _getToken(callback) {
  $.ajax({
    url: 'http://xxxx.com/images/token',
    type: 'GET',
    cache: false,
    success: function (message) {
      typeof callback === 'function' && callback(null, message.data.token);
    },
    error: function (err) {
      typeof callback === 'function' && callback(err);
    }
  });
}
