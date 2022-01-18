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
    if ("analytics" in document) analytics.track(event, properties);
  });
});
