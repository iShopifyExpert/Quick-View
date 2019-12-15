//Quick View

$(document).ready(function () {
  $.getScript("//cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.js").done(function() {
    quickView();
  });
});

function quickView() {
  $(".quick-view").click(function () {
    if ($('#quick-view').length == 0){$("body").append('<div id="quick-view"></div>');}
    var product_handle = $(this).data('handle');
    $('#quick-view').addClass(product_handle);
    jQuery.getJSON('/products/' + product_handle + '.js', function (product) {
      var title = product.title;
      var type = product.type;
      var price = 0;
      var original_price = 0;
      var desc = product.description;
      var images = product.images;
      var variants = product.variants;
      var options = product.options;
      var url = '/products/' + product_handle;
      $('.codehouse-product-title').text(title);
      $('.codehouse-product-type').text(type);
      $('.codehouse-product-description').html(desc);
      $('.view-product').attr('href', url);
      var imageCount = $(images).length;
      $(images).each(function (i, image) {
        if (i == imageCount - 1) {
          var image_embed = '<div><img src="' + image + '"></div>';
          image_embed = image_embed.replace('.jpg', '_800x.jpg').replace('.png', '_800x.png');
          $('.codehouse-product-images').append(image_embed);

          $('.codehouse-product-images').slick({
            'dots': false,
            'arrows': false,
            'respondTo': 'min',
            'useTransform': false
          }).css('opacity', '1');

        } else {
          image_embed = '<div><img src="' + image + '"></div>';
          image_embed = image_embed.replace('.jpg', '_800x.jpg').replace('.png', '_800x.png');
          $('.codehouse-product-images').append(image_embed);
        }
      });
      $(options).each(function (i, option) {
        var opt = option.name;
        var selectClass = '.option.' + opt.toLowerCase();
        $('.codehouse-product-options').append('<div class="option-selection-' + opt.replace(/\s+/g, '-').toLowerCase() + '"><span class="option">' + opt + '</span><select class="option-' + i + ' option ' + opt.replace(/\s+/g, '-').toLowerCase() + '"></select></div>');
        $(option.values).each(function (i, value) {
          $('.option.' + opt.replace(/\s+/g, '-').toLowerCase()).append('<option value="' + value + '">' + value + '</option>');
        });
      });
      $(product.variants).each(function (i, v) {
        if (v.inventory_quantity == 0) {
          $('.codehouse-add-button').prop('disabled', true).text('Sold Out');
          $('.codehouse-add-to-cart').hide();
          $('.codehouse-product-price').text('Sold Out').show();
          return true
        } else {
          price = parseFloat(v.price / 100).toFixed(2);
          original_price = parseFloat(v.compare_at_price / 100).toFixed(2);
          $('.codehouse-product-price').text('$' + price);
          if (original_price > 0) {
            $('.codehouse-product-original-price').text('$' + original_price).show();
          } else {
            $('.codehouse-product-original-price').hide();
          }
          $('select.option-0').val(v.option1);
          $('select.option-1').val(v.option2);
          $('select.option-2').val(v.option3);
          return false
        }
      });
    });

    $(document).on("change", "#quick-view select", function () {
      var selectedOptions = '';
      $('#quick-view select').each(function (i) {
        if (selectedOptions == '') {
          selectedOptions = $(this).val();
        } else {
          selectedOptions = selectedOptions + ' / ' + $(this).val();
        }
      });
      jQuery.getJSON('/products/' + product_handle + '.js', function (product) {
        $(product.variants).each(function (i, v) {
          if (v.title == selectedOptions) {
            var price = parseFloat(v.price / 100).toFixed(2);
            var original_price = parseFloat(v.compare_at_price / 100).toFixed(2);
            var v_qty = v.inventory_quantity;
            var v_inv = v.inventory_management;
            $('.codehouse-product-price').text('$' + price);
            $('.codehouse-product-original-price').text('$' + original_price);
            if (v_inv == null) {
              $('.codehouse-add-button').prop('disabled', false).text('Add to Cart');
            } else {
              if (v.inventory_quantity < 1) {
                $('.codehouse-add-button').prop('disabled', true).text('Sold Out');
              } else {
                $('.codehouse-add-button').prop('disabled', false).text('Add to Cart');
              }
            }
          }
        });
      });
    });
    $.fancybox({
      href: '#quick-view',
      maxWidth: 1040,
      maxHeight: 600,
      fitToView: true,
      width: '75%',
      height: '70%',
      autoSize: false,
      closeClick: false,
      openEffect: 'none',
      closeEffect: 'none',
      'beforeLoad': function () {
        var product_handle = $('#quick-view').attr('class');
        $(document).on("click", ".codehouse-add-button", function () {
          var qty = $('.codehouse-quantity').val();
          var selectedOptions = '';
          var var_id = '';
          $('#quick-view select').each(function (i) {
            if (selectedOptions == '') {
              selectedOptions = $(this).val();
            } else {
              selectedOptions = selectedOptions + ' / ' + $(this).val();
            }
          });
          jQuery.getJSON('/products/' + product_handle + '.js', function (product) {
            $(product.variants).each(function (i, v) {
              if (v.title == selectedOptions) {
                var_id = v.id;
                processCart();
              }
            });
          });
          function processCart() {
            jQuery.post('/cart/add.js', {
              quantity: qty,
              id: var_id
            },
                        null,
                        "json"
                       ).done(function () {
              $('.codehouse-add-to-cart-response').addClass('success').html('<span>' + $('.codehouse-product-title').text() + ' has been added to your cart. <a href="/cart">Click here to view your cart.</a>');
            })
            .fail(function ($xhr) {
              var data = $xhr.responseJSON;
              $('.codehouse-add-to-cart-response').addClass('error').html('<span><b>ERROR: </b>' + data.description);
            });
          }
        });
        $('.fancybox-wrap').css('overflow', 'hidden !important');
      },
      'afterShow': function () {
        $('#quick-view').hide().html(content).css('opacity', '1').fadeIn(function () {
          $('.codehouse-product-images').addClass('loaded');
        });
      },
      'afterClose': function () {
        $('#quick-view').removeClass().empty();
      }
    });
  });
};

$(window).resize(function () {
  if ($('#quick-view').is(':visible')) {
    $('.codehouse-product-images').slick('setPosition')
    $('.codehouse-product-images').slick({dots: true, swipeToSlide: true, infinite: true, slidesToShow: 1.5, slidesToScroll: 1.5});
  }
});
