(function () {
  'use strict';

  // Customer reviews. Add real reviews here and the section appears automatically.
  // Example: { name: 'Sam', suburb: 'Brighton', rating: 5, text: 'Great job, very tidy.' }
  var REVIEWS = [
    {
      name: 'Jenny K.', suburb: 'Richmond', rating: 5, source: 'Facebook review',
      text: 'Albert did an absolutely amazing job painting my investment property. I\u2019ve used painters in the past, but I have never experienced such a high-quality paint job. His attention to detail was exceptional \u2014 there wasn\u2019t a single paint spot or mess anywhere. He was also extremely trustworthy, reliable and professional. I\u2019m so happy with the result and would highly recommend Albert to anyone looking for a painter.'
    },
    {
      name: 'Rao B.', suburb: 'Narre Warren', rating: 5, source: 'Facebook review',
      text: 'Highly recommend Albert for any home painting projects! They recently painted the whole house of our home, and the results are incredible. From start to finish, the experience was smooth and stress-free. The attention to detail and clean lines are top-notch.'
    },
    {
      name: 'Jade A.', suburb: 'Berwick', rating: 5, source: 'Facebook review',
      text: 'We\u2019ve had a fantastic experience with Albert and would highly recommend Redon Painting! Albert is professional, reliable, hardworking and takes great pride in his work. His attention to detail and quality of workmanship are excellent. Am extremely happy with the results and wouldn\u2019t hesitate to use his services again. Highly recommend!'
    }
  ];

  var reviewSection = document.getElementById('reviews');
  var reviewList = document.getElementById('review-list');
  if (REVIEWS.length && reviewSection && reviewList) {
    var dotsBox = document.getElementById('review-dots');
    REVIEWS.forEach(function (r) {
      var card = document.createElement('figure');
      card.className = 'review';
      var top = document.createElement('div');
      if (r.rating) {
        top.className = 'stars';
        top.setAttribute('aria-label', r.rating + ' out of 5 stars');
        top.textContent = new Array(r.rating + 1).join('\u2605');
      } else {
        top.className = 'recommends';
        top.textContent = '\uD83D\uDC4D Recommends Redon Painting';
      }
      var q = document.createElement('blockquote');
      q.textContent = '\u201C' + r.text + '\u201D';
      var who = document.createElement('figcaption');
      who.className = 'who';
      who.textContent = r.name + (r.suburb ? ', ' + r.suburb : '') + (r.source ? ' \u00B7 ' + r.source : '');
      card.appendChild(top); card.appendChild(q); card.appendChild(who);
      reviewList.appendChild(card);
      if (dotsBox) dotsBox.appendChild(document.createElement('span'));
    });
    reviewSection.hidden = false;
    var navReviews = document.getElementById('nav-reviews');
    if (navReviews) navReviews.hidden = false;

    var prev = reviewSection.querySelector('.car-prev');
    var next = reviewSection.querySelector('.car-next');
    var cards = reviewList.children;
    function step() { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : reviewList.clientWidth; }
    function update() {
      var overflow = reviewList.scrollWidth > reviewList.clientWidth + 4;
      if (prev) prev.hidden = !overflow;
      if (next) next.hidden = !overflow;
      if (dotsBox) dotsBox.hidden = !overflow;
      if (!overflow) return;
      var i = Math.round(reviewList.scrollLeft / step());
      if (dotsBox) Array.prototype.forEach.call(dotsBox.children, function (d, n) { d.className = n === i ? 'on' : ''; });
      if (prev) prev.disabled = reviewList.scrollLeft <= 4;
      if (next) next.disabled = reviewList.scrollLeft + reviewList.clientWidth >= reviewList.scrollWidth - 4;
    }
    if (prev) prev.addEventListener('click', function () { reviewList.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { reviewList.scrollBy({ left: step(), behavior: 'smooth' }); });
    reviewList.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Quote form (Web3Forms)
  var form = document.getElementById('quote-form');
  var statusEl = document.getElementById('form-status');
  var photos = document.getElementById('photos');
  var thanks = document.getElementById('form-thanks');
  var again = document.getElementById('thanks-again');
  if (again && thanks && form) {
    again.addEventListener('click', function () {
      thanks.hidden = true;
      form.hidden = false;
      form.elements['name'].focus();
    });
  }
  var MAX_FILES = 3;
  var MAX_MB = 5;

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'status' + (type ? ' ' + type : '');
  }

  function send(fd) {
    return fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .catch(function () { return { success: false }; });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var files = photos && photos.files ? Array.prototype.slice.call(photos.files) : [];
      if (files.length > MAX_FILES) {
        setStatus('Please choose up to ' + MAX_FILES + ' photos.', 'err');
        return;
      }
      for (var i = 0; i < files.length; i++) {
        if (files[i].size > MAX_MB * 1024 * 1024) {
          setStatus('Each photo must be under ' + MAX_MB + ' MB.', 'err');
          return;
        }
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      setStatus('Sending\u2026');

      var fd = new FormData(form);
      if (!files.length) fd.delete('attachment');

      send(fd).then(function (res) {
        // If photos could not be attached, send the request again without them.
        if (!res.success && files.length) {
          fd.delete('attachment');
          fd.append('photos_note', 'Customer selected photos but they could not be attached: ' +
            files.map(function (f) { return f.name; }).join(', '));
          return send(fd);
        }
        return res;
      }).then(function (res) {
        btn.disabled = false;
        if (res && res.success) {
          var first = (form.elements['name'].value || '').trim().split(/\s+/)[0];
          form.reset();
          setStatus('');
          if (thanks) {
            document.getElementById('thanks-title').textContent =
              first ? 'Thanks, ' + first + '! We got your request.' : 'Thanks, we got your request!';
            form.hidden = true;
            thanks.hidden = false;
            thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
            thanks.focus({ preventScroll: true });
          } else {
            setStatus('Thanks! We have your request and will be in touch soon.', 'ok');
          }
        } else {
          setStatus('Sorry, something went wrong. Please call us on 0413 818 803.', 'err');
        }
      });
    });
  }
})();
