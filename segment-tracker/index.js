const CURRENT_URL = document.URL;

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

function get_reveal_and_qualified_information() {
  // Reveal won't be present anymore, so all traffic from now on will be non-qualified
  return {"qualified_traffic": false, "category": "Non-Qualified Traffic"}
}


function get_redirect(e){
  return e.currentTarget.getAttribute('href')
}


const camelToSnakeCase = text => text.split(/(?=[A-Z])/).join('_').toLowerCase();


function flattenDict(dictToFlatten, prefix) {
  function flatten(dict, parent) {
    var keys = [];
    var values = [];

    for(var key in dict) {
      if((typeof dict[key] === 'object') && !(Array.isArray(dict[key]))) {
        var result = flatten(dict[key], parent ? parent + '_' + key : key);
        keys = keys.concat(result.keys);
        values = values.concat(result.values);
      }
      else {
        keys.push(parent ? parent + '_' + key : key);
        values.push(dict[key]);
      }
    }

    return {
      keys : keys,
      values : values
    }
  }

  var result = flatten(dictToFlatten);
  var flatDict = {};

  for(var i = 0, end = result.keys.length; i < end; i++) {

    flatDict[`${prefix}${camelToSnakeCase(result.keys[i])}`] = result.values[i];

  }

  return flatDict;
}


$(document).ready(function () {

  // Create flags
  var button_event_triggered = false;

  const reveal_dimensions = get_reveal_and_qualified_information();

  // Fire Segment event
  if ("analytics" in window) {
    analytics.identify(reveal_dimensions)
    analytics.track("Traffic qualified", reveal_dimensions)
  }


  // capture a click on any element that has
  $("[data-analytics]").on("click", async function (e) {
    if (button_event_triggered) {
      button_event_triggered = false; // reset flag

      const redirect_to = get_redirect(e);

      if (redirect_to){
        window.location.href = redirect_to;
      }

      return true; // let the event bubble away
    }

    e.preventDefault();

    // Get event name
    var event = $(this).attr("data-analytics");

    var button_text = ($(this)?.context?.innerText || $(this)[0]?.text || $(this)[0]?.value)

    if (button_text) button_text = button_text.trim()
    
    var properties = {
      // capture the URL where this event is fired
      url: CURRENT_URL,
      text: button_text,
    };
    // Get additional properties from the form
    get_extra_attributes.call(this, properties);

    // Fire Segment event
    if ("analytics" in window) {
      await analytics.track(event, {...properties, "category": "CTAs"});
    }

    button_event_triggered = true; // set flag
    $(this).trigger('click');

  });


  // This only works for Webflow forms (Ajax based)
  $("form").on("submit", function () {

    var properties = {
      // capture the URL where this event is fired
      url: CURRENT_URL,
    };

    // Get additional properties from the form
    get_extra_attributes.call(this, properties);
    get_form_inputs.call(this, properties);

    // Fire Segment event
    if ("analytics" in window) {
      analytics.identify(properties)
      analytics.track("Form Submitted", {...properties, "category": "CTAs"});
    }

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
  });

});


// Hidden input URL handing

// "All" forms
window.onload = function() {
  $("form").each(function() {
    // Create a hidden input field with the URL
    $('<input>').attr({
      type: 'hidden',
      name: 'url',
      value: CURRENT_URL
    }).appendTo(this);  // Append the hidden field to each form
  });
};

// Hubspot forms -> Need to wait for the 'hsFormCallback'
window.addEventListener('message', event => {
  if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormReady') {
    $('input[name="url"]').val(CURRENT_URL).trigger('change');
  }
});