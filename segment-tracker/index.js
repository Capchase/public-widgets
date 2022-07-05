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
    if (input.type !== "submit") {
      properties[input.name.toLowerCase()] = $(this).val();
    } else{
      properties["button_text"] = $(this).val();
    }
  });
}

$(window).load(function () {
  // capture a click on any element that has
  $("[data-analytics]").on("click", function () {
    // Get event name
    var event = $(this).attr("data-analytics");
    
    var properties = {
      // capture the URL where this event is fired
      url: document.URL,
      text: ($(this)?.context?.innerText || $(this)[0]?.text).trim(),
    };
    // Get additional properties from the form
    get_extra_attributes.call(this, properties);
    
    // Fire Segment event
    if ("analytics" in window) analytics.track(event, properties);
  });


  // Add submit listener for all forms
  $("form").bind("submit", function (e) {

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

  });

});