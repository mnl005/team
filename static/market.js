let send_form_run = false;
let send_run = false;
let isRotated = false;
let product_make_form_button_index1 = 0;
let product_make_form_button_index2 = 0;

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
function product_img() {
  console.log("product_img");
  $(".product_left").height($(".product_left").width());
  $(".product_right").height($(".product_left").width());
  $(".product_left1").height($(".product_left1").width());
  $(".product_left").each(function () {
    $(this).height($(this).width());
  });
  $(".product_right").each(function () {
    $(this).height($(this).width());
  });

  $(".exp_img_auto_l>div").each(function () {
    $(this).height($(this).width());
  });
  $(".exp_img_auto_m>div").each(function () {
    $(this).height($(this).width());
  });
  $(".exp_img_auto_s>div").each(function () {
    $(this).height($(this).width());
  });
  $(".exp_img_static_one_rectangle_l").each(function () {
    $(this).height($(this).width() * 0.65);
  });
  $(".exp_img_static_one_rectangle_m").each(function () {
    $(this).height($(this).width() * 0.65);
  });
  $(".exp_img_static_one_rectangle_s").each(function () {
    $(this).height($(this).width() * 0.65);
  });
  $(".product_info1_form_other_content>div").each(function () {
    $(this).height($(this).width());
  });
}

$(document).ready(function () {
  product_img();
  img_view();
  nav_view();

  //베너순환
  let currentItem = $(".product_left>div:first").show();
  setInterval(function () {
    currentItem.hide();
    currentItem = currentItem.next().length
      ? currentItem.next()
      : $(".product_left>div:first");
    currentItem.show();
  }, 3000);

  let currentItem1 = $(".product_left1>div:first").show();
  setInterval(function () {
    currentItem1.hide();
    currentItem1 = currentItem1.next().length
      ? currentItem1.next()
      : $(".product_left1>div:first");
    currentItem1.show();
  }, 3000);

  $(window).resize(function () {
    // console.log("screan : " + $(window).width());
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
      case "nav":
        $(".nav_com").css("display", "none");
        $("#" + json.event_data).css("display", "block");
        product_img();
        break;
      case "pop":
        $(this).closest(".pop").slideToggle(500);
        break;
      case "delete":
        $(this)
          .closest(".delete")
          .slideToggle()
          .delay(1000)
          .queue(function (next) {
            $(this).closest(".delete").remove();
            next();
          });
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
        $(this)
          .closest(".product_info_nav")
          .children()
          .css("background-color", "#4c5a77");
        $(this).closest(".product_info_nav").children().css("color", "white");
        $(this).css("background-color", "white");
        $(this).css("color", "black");
        $(".product_info_box>div").css("display", "none");
        $("." + json.event_data).css("display", "block");
        break;
      case "product_review_box_grow_toggle":
        $(this).siblings(".product_review_box_one_detial").slideToggle();
        break;
      case "registration_form_button":
        $("#product_make_form").stop().slideToggle();
        break;
      case "product_make_form_toggle":
        let element = $(this);

        let rotateValue = isRotated ? "0turn" : "1turn";
        $(this).animate(
          {
            rotate: rotateValue,
          },
          {
            duration: 400,
            easing: "easeInOutQuad",
            step: function (now) {
              element.css("transform", "rotate(" + now + "deg)");
            },
            complete: function () {
              isRotated = !isRotated;
            },
          }
        );

        $("#product_make_form_type1").slideToggle();
        $("#product_make_form_type2").slideToggle().css("display", "flex");

        break;
      case "product_make_form_button1":
        if (
          json.event_data === "right" &&
          product_make_form_button_index1 < 11
        ) {
          $("#product_make_form_select1")
            .children()
            .eq(product_make_form_button_index1)
            .stop()
            .slideToggle();
          $("#product_make_form_select1")
            .children()
            .eq(product_make_form_button_index1 + 1)
            .stop()
            .slideToggle();
          product_make_form_button_index1 += 1;
          console.log(product_make_form_button_index1);
        } else if (
          json.event_data === "left" &&
          product_make_form_button_index1 > 0
        ) {
          $("#product_make_form_select1")
            .children()
            .eq(product_make_form_button_index1)
            .stop()
            .slideToggle();
          $("#product_make_form_select1")
            .children()
            .eq(product_make_form_button_index1 - 1)
            .stop()
            .slideToggle();
          product_make_form_button_index1 -= 1;
          console.log(product_make_form_button_index1);
        }
        break;
      case "product_make_form_button2":
        if (
          json.event_data === "right" &&
          product_make_form_button_index2 < 5
        ) {
          $("#product_make_form_select2")
            .children()
            .eq(product_make_form_button_index2)
            .stop()
            .slideToggle();
          $("#product_make_form_select2")
            .children()
            .eq(product_make_form_button_index2 + 1)
            .stop()
            .slideToggle();
          product_make_form_button_index2 += 1;
          console.log(product_make_form_button_index2);
        } else if (
          json.event_data === "left" &&
          product_make_form_button_index2 > 0
        ) {
          $("#product_make_form_select2")
            .children()
            .eq(product_make_form_button_index2)
            .stop()
            .slideToggle();
          $("#product_make_form_select2")
            .children()
            .eq(product_make_form_button_index2 - 1)
            .stop()
            .slideToggle();
          product_make_form_button_index2 -= 1;
          console.log(product_make_form_button_index2);
        }
        break;
      case "product_make_form_text":
        let text_option = $("#product_make_form_select1> div:visible").data(
          "json"
        ).data;
        console.log("text_option ::: " + text_option);
        let text_value = $("#product_make_form_select1_value").val();
        console.log("text_value ::: " + text_value);
        let div_text = $("<div>")
          .addClass(text_option)
          .addClass("delete")
          .text(text_value);
        div_text.append(`
        <div class="button delete_button"
        data-json='{"event_type": "delete", "event_data": "none", "url": "none", "type": "none", "data": "none"}'
        >삭제</div>
        `);
        $(".product_detail_explanation_ex").append(div_text);
        break;
      case "product_make_form_img":
        let img_option = $("#product_make_form_select2> div:visible").data(
          "json"
        ).data;

        if (
          img_option !== "exp_img_auto_l" &&
          img_option !== "exp_img_auto_m" &&
          img_option !== "exp_img_auto_s"
        ) {
          console.log("text_option ::: " + img_option);
          let img_view = $("#img_view");
          let firstChild = img_view.children().first();
          let backgroundImage = firstChild.css("background-image");

          let div_img = $("<div>", {
            class: img_option + " delete",
            style: "background-image: " + backgroundImage,
          });
          div_img.append(`
          <span class="button delete_button"
          data-json='{"event_type": "delete", "event_data": "none", "url": "none", "type": "none", "data": "none"}'
          >삭제</span>
          `);
          $(".product_detail_explanation_ex").append(div_img);
          product_img();
        } else {
          console.log("asdf");
          console.log("text_option ::: " + img_option);

          let div_img = $("<div>").addClass(img_option).addClass("delete");
          let img_view = $("#img_view");
          img_view.children().each(function () {
            const cloneElement = $(this).clone();
            div_img.append(cloneElement);
          });
          div_img.append(`
          <span class="button delete_button"
          data-json='{"event_type": "delete", "event_data": "none", "url": "none", "type": "none", "data": "none"}'
          >삭제</span>
          `);
          $(".product_detail_explanation_ex").append(div_img);
          product_img();
        }

        break;
      case "prdouct_info_done":
        let product_array = [];
        $(".registration_product_info_option_body_one").each(function () {
          let pair = {};
          pair[$(this).find(".input1").val()] = $(this).find(".input2").val();
          product_array.push(pair);
        });
        console.log(product_array);

        let product_data = {};
        $(".input").each(function () {
          let name = $(this).attr("name");
          let value = $(this).val();
          product_data[name] = value;
        });
        console.log(product_data);

        if (
          $(".input").filter(function () {
            return $(this).val() == "";
          }).length > 0
        ) {
          $(".wornning2").stop().slideToggle();
          setTimeout(() => {
            $(".wornning2").stop().slideToggle();
          }, 2000);
        } else if (
          $(".input1").filter(function () {
            return $(this).val() == "";
          }).length > 0
        ) {
          $(".wornning3").stop().slideToggle();
          setTimeout(() => {
            $(".wornning3").stop().slideToggle();
          }, 2000);
        } else if (
          $(".input2").filter(function () {
            return $(this).val() == "";
          }).length > 0
        ) {
          $(".wornning3").stop().slideToggle();
          setTimeout(() => {
            $(".wornning3").stop().slideToggle();
          }, 2000);
        } else {
          alert("상품 정보 정상! 다음 단계로 이동하세요");
        }

        $.each(product_data, function (key, value) {
          $("#" + key).text(value);
        });
        $("#registration_product_info_option_view").empty();
        $.each(product_array, function (index, obj) {
          $.each(obj, function (key, value) {
            let html = `<div class="registration_product_info_option_body_one1">
                        <div>${key}</div>
                        <div>${value}</div>
                      </div>`;
            $("#registration_product_info_option_view").append(html);
          });
        });

        break;
      case "dot":
        $(this)
          .closest(".registration_dot")
          .children(".registration_dot_box")
          .find(".dot-bubble")
          .removeClass("dot-bubble");
        $(this)
          .closest(".registration_dot")
          .children(".registration_dot_box")
          .css({
            "background-color": "rgb(83, 109, 255);",
            color: "white",
          });

        $(this).css({
          "background-color": "white",
          color: "rgb(83, 109, 255)",
        });

        $(this).children(".dot-bubbles").addClass("dot-bubble");
        break;
      case "timeline":
        let index = json.event_data - 1;

        let index_bool1 = $("#timeline")
          .children(".section")
          .eq(index + 1)
          .hasClass("filled");
        let index_bool2 = $("#timeline")
          .children(".section")
          .eq(index + 2)
          .hasClass("filled");
        let index_bool3 = $("#timeline")
          .children(".section")
          .eq(index - 1)
          .hasClass("filled");

        console.log("index : " + index);
        $("#registration_in>div").stop().hide();

        if (index === 0) {
          $("#registration_product_info").stop().show();
        } else if (index === 1) {
          $(".product_detail_explanation").stop().show();
        } else if (index === 2) {
          $("#registration_setting").stop().show();
        } else if (index === 3) {
          $("#registration_done").stop().show();
        }

        if (!index_bool1 && index_bool3) {
          $("#timeline")
            .children(".section")
            .eq(index)
            .removeClass("unfilled")
            .addClass("filled");
        } else if (!index_bool2 && index_bool3) {
          $("#timeline")
            .children(".section")
            .eq(index + 1)
            .removeClass("filled")
            .addClass("unfilled");
        } else if (index === 0 && !index_bool2) {
          $("#timeline")
            .children(".section")
            .eq(index + 1)
            .removeClass("filled")
            .addClass("unfilled");
          $("#registration_form").stop().show();
          $("#registration_in").stop().show();
        } else {
          $(".wornning1").stop().slideToggle();
          setTimeout(() => {
            $(".wornning1").stop().slideToggle();
          }, 2000);
        }

        break;
      case "prdouct_info_add":
        $(".registration_product_info_option_body").append(`
      <div class="registration_product_info_option_body_one">
      <input class="input1" type="text">
      <input class="input2" type="text"  value="0">
    </div>
      `);
        break;
      case "prdouct_info_del":
        $(
          ".registration_product_info_option_body .registration_product_info_option_body_one:last"
        ).remove();
        break;
      case "registration_done":
        let info = {};

        info.brand = $("#brand").text();
        info.name = $("#name").text();
        info.price = $("#price").text();
        info.del = $("#del").text();
        info.change = $("#change").text();
        info.ban = $("#ban").text();
        info.per = $("#per").text();
        info.make_won = $("#make_won").text();
        info.make_su = $("#make_su").text();
        info.cus = $("#cus").text();

        console.log(info);

        let array = [];

        $(
          "#registration_product_info_option_view .registration_product_info_option_body_one1"
        ).each(function () {
          let pair = {};
          pair[$(this).children("div").first().text()] = $(this)
            .children("div")
            .last()
            .text();
          array.push(pair);
        });

        console.log(array);

        const childrenHTML = $(".product_detail_explanation_ex")
        .children()
        .map(function () {
            // clone the current element
            let clone = $(this).clone();
            // remove .delete_button from the clone
            clone.find('.delete_button').remove();
            // return the outerHTML of the clone
            return clone[0].outerHTML;
        })
        .get()
        .join("");
    console.log(childrenHTML);
    

      


        break;
      default:
        console.log("이벤트타입 없음");
        break;
    }
    // product_img();
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
    // console.log(currentScrollTop);
    // console.log(lastScrollTop);
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

function img_view() {
  $("#img_add").change(function () {
    $("#img_view").empty();
    const files = Array.from($(this)[0].files);
    const imgView = $("#img_view");

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        const div = $("<div>").css("background-image", `url(${imageUrl})`);
        imgView.append(div);
      };
      reader.readAsDataURL(file);
    });
  });
}
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
