$(document).ready(function () {
  // capture a click on any element that has
  $("[data-analytics]").on("click", function () {
    var properties = {
      // capture the URL where this event is fired
      url: document.URL,
      text: $(this).context.innerText,
    };
    var event = $(this).attr("data-analytics");
    // for each attribute on the element we clicked...
    $.each(this.attributes, function (_, attribute) {
      if (attribute.name.startsWith("data-property-")) {
        var property = attribute.name.split("data-property-")[1];
        properties[property] = attribute.value;
      }
    });
    // Fire Segment event
    if ("analytics" in window) analytics.track(event, properties);
  });

  // we can just capture the submit action as it only exists in forms
  $("[data-analytics]").on("submit", function (e) {
    e.preventDefault();
    // Get event name
    const event = $(this).attr("data-analytics");
    // We need the form to have an email field just in case analytics has not loaded
    let email = $(this).find("input[name='Email']").val() || $(this).find("input[name='email']").val();

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

      $('<input>').attr({
        type: 'hidden',
        name: 'event',
        value: event,
      }).appendTo(this);
    }
    // Continue with usual submit process
    $(this).unbind('submit').submit();
  });

});