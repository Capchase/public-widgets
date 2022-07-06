function get_extra_attributes(properties) {
  $.each(this.attributes, function (_, attribute) {
    if (attribute.name.startsWith("data-property-")) {
      var property = attribute.name.split("data-property-")[1];
      properties[property] = attribute.value;
    }
  });
}

function get_form_inputs(properties) {
  $.each($(this).find('input'), function (_, input) {
    // The submit button appears as an input... So we want to add
    if (input.type.toLowerCase() !== "submit") {
      properties[input.name.toLowerCase().split("-")[0]] = $(this).val();
    } else{
      properties["button_text"] = $(this).val();
    }
  });
}

var button_event_triggered = false;
var form_event_triggered = false;

$('.button').on('click', function(e) {
  if (lots_of_stuff_already_done) {
    lots_of_stuff_already_done = false; // reset flag
    return; // let the event bubble away
  }

  e.preventDefault();

  // do lots of stuff

  lots_of_stuff_already_done = true; // set flag
  $(this).trigger('click');
});


$(document).ready(function () {
  // capture a click on any element that has
  $("[data-analytics]").on("click", async function (e) {
    if (button_event_triggered) {
      button_event_triggered = false; // reset flag
      return; // let the event bubble away
    }

    e.preventDefault();

    // Get event name
    var event = $(this).attr("data-analytics");

    var button_text = ($(this)?.context?.innerText || $(this)[0]?.text || $(this)[0]?.value)

    if (button_text) button_text = button_text.trim()
    
    var properties = {
      // capture the URL where this event is fired
      url: document.URL,
      text: button_text,
    };
    // Get additional properties from the form
    get_extra_attributes.call(this, properties);
    // Fire Segment event
    if ("analytics" in window) await analytics.track(event, properties);

    button_event_triggered = true; // set flag
    $(this).trigger('click');

  });


  // Add submit listener for all forms
  $("form").on("submit", function (e) {

    if (form_event_triggered) {
      form_event_triggered = false; // reset flag
      return; // let the event bubble away
    }

    e.preventDefault();

    var properties = {
      // capture the URL where this event is fired
      url: document.URL,
    };

    // Get additional properties from the form
    get_extra_attributes.call(this, properties);
    get_form_inputs.call(this, properties);

    // Fire Segment event
    if ("analytics" in window) analytics.track("Form Submitted", properties);

    // We need the form to have an email field just in case analytics has not loaded
    let email = $('input[name ="email" i]').val();

    if (!email){
      $.each($(this).find('input'), function (_, input) {
        // The submit button appears as an input... So we want to add
        if((input.type).toLowerCase().includes("email")) email = $(this).val()
      });
    }

    if (email){
      
      // Default anonymous_id just in case analytics has not loaded
      let anonymous_id = email;

      // If analytics has loaded, get Segment's anonymousId
      if ("analytics" in window) anonymous_id = analytics.user().anonymousId();

      // Append hidden field to the form
      $('<input>').attr({
        type: 'hidden',
        name: 'anonymousId',
        value: anonymous_id,
      }).appendTo(this);

    }

    form_event_triggered = true; // set flag
    $(this).trigger('submit');

  });

});