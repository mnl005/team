let send_form_run = false;
let send_run = false;
// 폼전송
async function send_form(element) {
  loading();
  if (send_form_run) {
    console.error("이미 요청을 보냈습니다");
    return;
  }
  if (!element) {
    console.error("잘못된 폼 요소입니다");
    return;
  }

  send_form_run = true;

  try {
    let form = $(element).closest("form");
    let formData = new FormData(form[0]);
    let url = form[0].action;
    let type = form[0].method;

    let data = {};

    for (let [key, prop] of formData) {
      if (prop instanceof Blob) {
        // If multiple files, then we create an array if it's not already created
        if (!(data[key] instanceof Array)) {
          data[key] = [];
        }
        await getBase64(prop).then((base64String) => {
          data[key].push(base64String);
        });
      } else {
        data[key] = prop;
      }
    }

    if (data["method"] === "delete") {
      type = "delete";
    }
    if (data["method"] === "put") {
      type = "put";
    }

    console.log("url : " + url);
    console.log("type : " + type);
    console.log("data : ");
    console.log(data);

    const response = await $.ajax({
      url: url,
      type: type,
      data: data,
      contentType: "application/json",
    });

    send_end(response);
  } catch (error) {
  } finally {
    send_form_run = false;
    loading_end();
  }
}

//일반전송
function send(req) {
  return new Promise((resolve, reject) => {
    if (send_run) {
      // return Promise.reject(new Error("이미실행중.."));
      return Promise.resolve();
    }
    loading();
    console.log("event_type : " + req.event_type);
    console.log("event_data : " + req.event_data);
    console.log("url : " + req.url);
    console.log("type : " + req.type);
    console.log("data : ");
    console.log(JSON.stringify({ data: req.data }));
    send_run = true;
    $.ajax({
      url: req.url,
      type: req.type,
      data: JSON.stringify({ data: req.data }),
      contentType: "application/json",
      success: function (response) {
        resolve(response);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        loading_end();
      },
      complete: function () {
        send_run = false;
      },
    });
  });
}

$(document).ready(function () {


  //레이아웃 크기조절
  $(".banner").height($(".banner").width() * 0.6);
  $(window).resize(function () {
    $(".banner").height($(".banner").width() * 0.6);
  });

  //클릭이벤트
  $(document).on("click", ".button", async function (event) {
    let json = $(this).data("json");

    if (json.url !== "none") {
      send(json)
        .then((res) => {
          send_end(res);
        })
        .catch((error) => {})
        .finally(() => {
          loading_end();
        });
    }
    console.log("event_type : " + json.event_type);
    console.log("event_data : " + json.event_data);
    switch (json.event_type) {

      default:
        console.log("이벤트타입 없음");
        break;
    }
  });

  $(document).on("mouseenter mouseleave", ".hover", function (event) {
    let json = $(this).data("json");
    console.log(json.event_type);
    console.log(json.event_data);
    switch(json.event_type){
        default:
            console.log("호버이벤트 미등록");
        break;
    }
  });

});

function rotateBanner() {
  var banner = $(".banner");
  var activeElement = banner.find(".active");
  var nextElement = activeElement.next();

  if (nextElement.length === 0) {
    nextElement = banner.children().first();
  }

  activeElement.removeClass("active");
  nextElement.addClass("active");
}

setInterval(rotateBanner, 3000);
