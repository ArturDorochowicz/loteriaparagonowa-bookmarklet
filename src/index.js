(window.__axd = window.__axd || (function () {
  var $ = window.jQuery;
  var $origForm = $('#registration-form');
  var $el;

  function parseDataLine(defaults, dataLine) {
    var parts = dataLine.split(' ', 5);
    var kwota = parts[3].split(/[.,]/, 2);
    var kwota_zl = kwota[0].trim();
    var kwota_gr = (kwota[1] || '00').trim();
    var value = {
      nip: parts[0].trim(),
      dzien: parts[1].trim(),
      nr_wydruku: parts[2].trim(),
      kwota_zl: kwota_zl,
      kwota_gr: kwota_gr,
      nr_kasy: parts[4].trim()
    };
    return $.extend({}, defaults, value);
  }

  function parseData(defaults, data) {
    return data
      .split('\n')
      .filter(function (line) { return line.trim().length > 0; })
      .map(function (line) { return parseDataLine(defaults, line); });
  }

  function createDefaults(phone, email, today) {
    return {
      nr_tel: phone,
      email: email,
      rok: String(today.getFullYear()),
      miesiac: String(today.getMonth() + 1),
      branza: '',
      /*captcha: '4',*/
      nip: '',
      dzien: '',
      nr_wydruku: '',
      kwota_zl: '',
      kwota_gr: '',
      nr_kasy: '',
      zgoda_dane: 'true',
      zgoda_wizerunek: 'false'
    };
  }

  function send(value, $result) {
    function setText(text) {
      $result.val(text);
    }

    setText('');
    var data = JSON.parse(value);
    $.post('https://loteriaparagonowa.gov.pl/paragon/stworz', data)
      .fail(function (err) {
        setText(String(err));
      })
      .done(function(data) {
        if (data.success) {
          setText($(data.message).text());
        } else {
          setText(data.message);
        }
      });
  }

  function load(form) {
    var defaults = createDefaults(form.phone.trim(), form.email.trim(), new Date());
    var items = parseData(defaults, form.data);
    var strings = items.map(function (it) { return JSON.stringify(it, null, '  '); });
    var lis = strings.map(function (it, idx) {
      var html =
        "<li>" +
        " <form class='axd-send'>" +
        "  <button type='submit' style='width:35%; vertical-align:top;'>Wyślij</button>" +
        "  <textarea name='data' style='width:58%; height:100px; margin-left:3%; color:#36393d;'></textarea>" +
        "  <textarea readonly placeholder='Wynik' class='result' style='width:96%; color:#36393d;'></textarea>" +
        " </form>" +
        "</li>";
      return $(html)
        .find(':input[name=data]')
        .val(it)
        .end();
    });

    var html =
      "<div>" +
      " <form class='sendall'>" +
      "  <button type='submit'>Wyślij wszystkie</button>" +
      " </form>" +
      " <ol>" +
      " </ol>" +
      "</div>";
    return $(html)
      .find('ol')
      .append(lis)
      .end();
  }

  function serializeForm($form) {
    return $form
      .serializeArray()
      .reduce(function (acc, it) { acc[it.name] = it.value; return acc; }, {});
  }

  function create() {
    var html =
      "<div id='axd' class='axd'>" +
      " <form class='axd-load'>" +
      "  <div class='form-group'>" +
      "   <div class='form-inputs' style='width:96%; color:#36393d;'>" +
      "    <input name='phone' value='' placeholder='nr telefonu' />" +
      "   </div>" +
      "  </div>" +
      "  <div class='form-group'>" +
      "   <div class='form-inputs' style='width:96%; color:#36393d;'>" +
      "    <input name='email' value='' placeholder='email' />" +
      "   </div>" +
      "  </div>" +
      "  <div class='form-group' style='height:150px; margin-bottom:10px;'>" +
      "   <div class='form-label' style='width:96%;'>NIP dzień nr_wydruku kwota nr_kasy</div>" +
      "   <div class='form-inputs' style='height:90%; width:96%; color:#36393d;'>" +
      "    <textarea name='data' placeholder='5624332189 21 3020 10,00 aeb04395129' style='height:100%; width:100%;'></textarea>" +
      "   </div>" +
      "  </div>" +
      "  <button name='load' type='submit'>Wczytaj</button>" +
      " </form>" +
      " <hr/>" +
      " <div class='axd-data'></div>" +
      "</div>";

    return $(html)
      .on('submit', 'form.axd-load', function (ev) {
        ev.preventDefault();
        var $form = $(ev.target);
        var form = serializeForm($form);
        $form
          .closest('.axd')
          .find('.axd-data')
          .children()
          .remove()
          .end()
          .append(load(form));
      })
      .on('submit', 'form.sendall', function (ev) {
        ev.preventDefault();
        $(ev.target)
          .closest('.axd-data')
          .find('form.axd-send')
          .submit();
      })
      .on('submit', 'form.axd-send', function (ev) {
          ev.preventDefault();
          var $form = $(ev.target);
          var $result = $form.find('.result');
          var form = serializeForm($form);
          send(form.data, $result);
      });
  }

  return function () {
    if ($el) {
      $el.remove();
      $el = null;
      $origForm.fadeIn();
    } else {
      $origForm.fadeOut();
      $('#form').append($el = create());
    }
  };
}()))();
