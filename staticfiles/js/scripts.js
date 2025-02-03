$(document).ready(function() {
    $('#like-section form').on('submit', function(event) {
        event.preventDefault();  // Stop the form from submitting normally
        var threadId = $('input[name="thread_id"]').val();  // Get the thread ID from the hidden input
        var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();  // CSRF token for POST request

        $.ajax({
            type: 'POST',
            url: $(this).attr('action'),  // Use the action URL from the form itself
            data: {
                'thread_id': threadId,
                'csrfmiddlewaretoken': csrfToken
            },
            success: function(response) {
                $('#like-count').text(response.total_likes + ' Likes');  // Update the like count
                // Optionally update the button based on the new state
                var button = $('#like-section button');
                if (response.is_liked) {
                    button.removeClass('btn-primary').addClass('btn-danger').text('Dislike');
                } else {
                    button.removeClass('btn-danger').addClass('btn-primary').text('Like');
                }
            },
            error: function(xhr, status, error) {
                console.error("Error: " + error);  // Log errors
            }
        });
    });
});



const pageTitle = document.querySelector('.pageTitle, .big');
const text = pageTitle.innerHTML;
pageTitle.innerHTML = "";

let i = 0;
function typeWriter() {
  if (i < text.length) {
    pageTitle.innerHTML += text.charAt(i);
    i++;
    setTimeout(typeWriter, 250); // Adjust typing speed
  }
}

typeWriter(); // Start the effect

let degree = 0;
let animationFrameId = null;
const bodyElement = document.body;

function updateGradient() {
    const width = document.documentElement.scrollWidth;
    const height = document.documentElement.scrollHeight;
    const size = Math.max(width, height) * 2;

    degree = (degree + 0.5) % 360; // Increment degree slowly to animate rotation
    const gradientColor = `linear-gradient(${degree}deg, rgba(255,0,0,1), rgba(0,0,255,1))`;
    bodyElement.style.backgroundImage = gradientColor;
    bodyElement.style.backgroundSize = `${size}px ${size}px`;
    bodyElement.style.backgroundPosition = 'center center';
    bodyElement.style.backgroundRepeat = 'no-repeat';

    animationFrameId = requestAnimationFrame(updateGradient); // Continue the animation
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

// Debounced version of updating the gradient only once
const debouncedResizeHandler = debounce(function() {
    // Cancel the current animation frame if it exists
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    // Restart the animation with the new dimensions
    startAnimation();
}, 50);

// Event listener to handle window resize
window.addEventListener('resize', debouncedResizeHandler);

// Start the animation when the document is loaded
document.addEventListener('DOMContentLoaded', startAnimation);

// Stop the animation on page unload to prevent memory leaks
window.addEventListener('beforeunload', stopAnimation);


document.addEventListener('DOMContentLoaded', function() {
    const logoImage = document.querySelector('.logo-image');
    gsap.to(logoImage, { 
        duration: 2, 
        y: "+=30", 
        repeat: -1, 
        yoyo: true, 
        ease: "sine.inOut", 
        modifiers: {
            y: gsap.utils.unitize((y) => {
                return Math.sin(parseFloat(y) * Math.PI / 180) * 20;
            })
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const logoImage = document.querySelector('.logo-image');
    gsap.to(logoImage, { 
        duration: 1, 
        scale: 1.2, 
        repeat: -1, 
        yoyo: true, 
        ease: "power1.inOut"
    });
});

$(document).ready(function(){
    $(".panel-heading").click(function(){
        var target = $(this).data("target");
        $(target).toggle();
    });
});

module.exports = {
    typeWriter,
    startAnimation,
    stopAnimation,
    initGSAPAnimations,
    togglePanel
};


