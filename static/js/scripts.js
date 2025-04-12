$(document).ready(function() {
  $('#like-section form').on('submit', function(event) {
      event.preventDefault();
      var threadId = $('input[name="thread_id"]').val();
      var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

      $.ajax({
          type: 'POST',
          url: $(this).attr('action'),
          data: {
              'thread_id': threadId,
              'csrfmiddlewaretoken': csrfToken
          },
          success: function(response) {
              $('#like-count').text(response.total_likes + ' Likes');
              var button = $('#like-section button');
              if (response.is_liked) {
                  button.removeClass('btn-primary').addClass('btn-orange').text('Dislike');
              } else {
                  button.removeClass('btn-orange').addClass('btn-primary').text('Like');
              }
          },
          error: function(xhr, status, error) {
              console.error("Error: " + error);
          }
      });
  });
});

const pageTitle = document.querySelector('.pageTitle, .big');
if (pageTitle) {
const text = pageTitle.innerHTML;
pageTitle.innerHTML = "";

let i = 0;
function typeWriter() {
  if (i < text.length) {
    pageTitle.innerHTML += text.charAt(i);
    i++;
    setTimeout(typeWriter, 250);
  }
}
typeWriter();
}

let degree = 0;
let animationFrameId = null;
const bodyElement = document.body;

function updateGradient() {
const width = document.documentElement.scrollWidth;
const height = document.documentElement.scrollHeight;
const size = Math.max(width, height) * 2;

degree = (degree + 0.25) % 360;

const gradientColor = `linear-gradient(${degree}deg,
)`;

bodyElement.style.backgroundImage = gradientColor;
bodyElement.style.backgroundSize = `${size}px ${size}px`;
bodyElement.style.backgroundPosition = 'center center';
bodyElement.style.backgroundRepeat = 'no-repeat';

animationFrameId = requestAnimationFrame(updateGradient);
}

function startAnimation() {
if (!animationFrameId) {
  updateGradient();
}
}

function stopAnimation() {
if (animationFrameId) {
  cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
}
}

function debounce(func, wait) {
let timeout;
return function executedFunction(...args) {
  const later = () => {
    clearTimeout(timeout);
    func(...args);
  };
  clearTimeout(timeout);
  timeout = setTimeout(later, wait);
};
}

const debouncedResizeHandler = debounce(function() {
if (animationFrameId) {
  cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
}
startAnimation();
}, 50);

window.addEventListener('resize', debouncedResizeHandler);
document.addEventListener('DOMContentLoaded', startAnimation);
window.addEventListener('beforeunload', stopAnimation);

document.addEventListener('DOMContentLoaded', function() {
const logoImage = document.querySelector('.logo-image');
if (logoImage) {
  gsap.to(logoImage, {
    duration: 1.5,
    scale: 1.1,
    y: '+=30',
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  });
}
});

$(document).ready(function(){
$(".panel-heading").click(function(){
  var target = $(this).data("target");
  $(target).toggle();
});
});

document.addEventListener("DOMContentLoaded", function () {
const ctx1 = document.getElementById('tokenomicsChart')?.getContext('2d');
if (!ctx1) return;

const tokenomicsChart = new Chart(ctx1, {
  type: 'doughnut',
  data: {
    labels: [
      'Liquidity Pool (50%)',
      'Marketing & Dev (22.2%)',
      'Staking (14.1%)',
      'Team (9.7%)',
      'Encouragement Fund (4%)'
    ],
    datasets: [{
      label: 'XEAM Tokenomics',
      data: [50, 22.2, 14.1, 9.7, 4],
      backgroundColor: [
        '#49c5b6', // Teal
        '#f9943b', // Orange
        '#b06cc0', // Purple
        '#ffcc00', // Optional gold/yellow
        '#ffffff'  // Light fallback
      ],
      borderColor: '#0d0b1f',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
          padding: 10,
          font: {
            size: 13,
            weight: '500'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label} – ${context.raw}%`;
          }
        }
      }
    }
  }
});
});


module.exports = {
    typeWriter,
    startAnimation,
    stopAnimation,
    initGSAPAnimations,
    togglePanel
};


