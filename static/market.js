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
//nav
function nav_view() {

  if ($(window).width() < 760) {
    $(".nav2").css("display", "flex");
    $(".nav2_top").css("display", "flex");
    $(".nav1").css("display", "none");
  } else {
    $(".nav2").css("display", "none");
    $(".nav2_top").css("display", "none");
    $(".nav1").css("display", "flex");
  }
}
//상품디테일 이미지 크기조절
function product_img(){
  $(".product_left").height($(".product_left").width());
  $(".product_right").height($(".product_left").width());
  $(".exp_img_auto_l>div").each(function() {
    $(this).height($(this).width());
  });
  $(".exp_img_auto_m>div").each(function() {
    $(this).height($(this).width());
  });
  $(".exp_img_auto_s>div").each(function() {
    $(this).height($(this).width());
  });
  $(".exp_img_static_one_rectangle_l").each(function() {
    $(this).height($(this).width()*0.65);
  });
  $(".exp_img_static_one_rectangle_m").each(function() {
    $(this).height($(this).width()*0.65);
  });
  $(".exp_img_static_one_rectangle_s").each(function() {
    $(this).height($(this).width()*0.65);
  });
  $(".product_info1_form_other_content>div").each(function() {
    $(this).height($(this).width());
  });
  console.log($(".product_right").width());
  if($(".product_right").width() < 470){
    $(".product_info1_form_other_content").hide();
    $(".product_info1_form_other_title").hide();
  }
  else{
    $(".product_info1_form_other_content").show();
    $(".product_info1_form_other_title").show();
    $(".product_info1_form_other_content>div").each(function() {
      $(this).height($(this).width());
    });
  }
}

$(document).ready(function () {
  nav_view();
  //레이아웃 크기조절


  //상품디테일 이미지 크기조절
  product_img();
  

  

  //베너순환
  let currentItem = $(".product_left>div:first").show();
  setInterval(function () {
    currentItem.hide();
    currentItem = currentItem.next().length
      ? currentItem.next()
      : $(".product_left>div:first");
    currentItem.show();
  }, 3000); // 1초마다 실행

  $(window).resize(function () {
    console.log("screan" + $(window).width());
    $(".product_left").height($(".product_left").width());
    $(".product_right").height($(".product_left").width());
        //상품디테일 이미지 크기조절
  product_img();
    nav_view();
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
      case "pop":
        $(this).closest(".pop").slideToggle(500);
        break;
      case "open":
        $("#" + json.event_data).slideToggle(500);
          product_img();
        break;
      case "product_type_selecter":
        $("#product_type_selecter_in").stop().slideToggle();
        break;
      case "product_sort_selecter":
        $("#product_sort_selecter_in").stop().slideToggle();
        break;
      case "product_sort":
        if (json.event_data === "column") {
          $("#product_con").css("flex-flow", "column");
          $(".product_box").css("flex-flow", "row nowrap");
          $(".product_box").css("width", "100%");
          $(".product_box").css("max-width", "700px");
        } else if (json.event_data === "row1") {
          $("#product_con").css("flex-flow", "row wrap");
          $(".product_box").css("flex-flow", "column");
          $(".product_box").css("width", "fit-content");
          $(".product_box").css("max-width", "fit-content");
          $(".product_box").css("min-width", "300px");
        } else {
          $("#product_con").css("flex-flow", "row wrap");
          $(".product_box").css("flex-flow", "column");
          $(".product_box").css("width", "fit-content");
          $(".product_box").css("max-width", "fit-content");
          $(".product_box").css("min-width", "0px");
        }

        break;
      case "product_info_nav_button":
        $(this).closest(".product_info_nav").children().css("background-color","#4c5a77");
        $(this).closest(".product_info_nav").children().css("color","white");
        $(this).css("background-color","white");
        $(this).css("color","black");
        $(".product_info_box>div").css("display","none");
        $("." + json.event_data).css("display","block");
        break;
      case "product_review_box_grow_toggle":
        $(this).siblings(".product_review_box_one_detial").slideToggle();
      break;
      
      
      
      
      
      
      
        default:
        console.log("이벤트타입 없음");
        break;
    }
  });

  //호버이벤트
  $(document).on("mouseenter mouseleave", ".hover", function (event) {
    let json = $(this).data("json");
    console.log(json.event_type);
    console.log(json.event_data);
    switch (json.event_type) {
      default:
        console.log("호버이벤트 미등록");
        break;
    }
  });

  //스크롤이벤트
  let lastScrollTop = 0;

  $(document).scroll(function () {
    let currentScrollTop = $(this).scrollTop();

    if (currentScrollTop > lastScrollTop) {
      // 스크롤이 내려갈 때
      $(".nav1").fadeOut();
      $(".nav2").fadeOut();
      $(".nav2_top").fadeOut();
    } else {
      // 스크롤이 올라갈 때
      if ($(window).width() < 760) {
        $(".nav2").fadeIn();
        $(".nav2_top").fadeIn();
      } else {
        $(".nav1").fadeIn();
      }
    }

    lastScrollTop = currentScrollTop;
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
