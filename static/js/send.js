$(document).on("click", ".button", async function (event) {

  let json = $(this).data("json");

  if (json.url !== "none") {

    send(json)
      .then((res) => {
        send_end(res);
      })
      .catch((error) => {
        console.error(`요청 실패: ${error}`);
      })
      .finally(() => {
        loading_end();
      });
  }

  switch (json.event_type) {
    //창닫기
    case "close_pop":
      $(".pop").css("display", "none");
      break;

    // 창열기
    case "open_pop":
      $(".pop").css("display", "none");
      $("#" + json.event_data).css("display", "flex");
      break;

    default:
      console.log("이벤트타입 없음");
      break;
  }
});

let send_run = false;
function send(req) {
  return new Promise((resolve, reject) => {
    if (send_run) {
      reject(new Error("이미 요청중입니다"));
    }
    if (!req || !req.url || !req.type || !req.data) {
      reject(new Error("잘못된 접근입니다"));
    }

    console.log("event_type : " + req.event_type);
    console.log("event_data : " + req.url);
    console.log("url : " + req.url);
    console.log("type : " + req.type);
    console.log("data : " + req.data);
    send_run = true;

    $.ajax({
      url: req.url,
      type: req.type,
      data: { data: req.data },
      contentType: "application/json",
      success: function (response) {
        resolve(response);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error(`요청 실패: ${errorThrown}`);
        reject(errorThrown);
      },
      complete: function () {
        send_run = false;
      },
    });
  });
}

let send_form_run = false;
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
    formData.forEach((value, key) => {
      data[key] = value;
    });

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
    console.error(error);
  } finally {
    send_form_run = false;
    loading_end();
  }
}

function send_end(res) {
  console.log("$$$send_end$$$");
  console.log(res);
  msg(res.msg_title,res.msg_main);

}

function loading() {
  $("#spinner").show();
}

function loading_end() {
  $("#spinner").hide();
}

function msg(title,main) {
    $("#msg").fadeIn(500);
    $("#msg_title").text(title);
    $("#msg_main").text(main);

    // 2초 후에 요소를 숨긴다
    setTimeout(function() {
        $("#msg").fadeOut(500);
    }, 2000);
}

