$(document).ready(function () {
  // capture a click on any element that has
  $("[data-analytics]").on("click", function (e) {
    var properties;
    var event = $(this).attr("data-analytics");
    // for each attribute on the element we clicked...
    $.each(this.attributes, function (_, attribute) {
      // if this attribute corresponds to a property
      if (attribute.name.startsWith("data-property-")) {
        // if this is the first property, make sure properties is a dictionary and not undefined
        if (!properties) properties = {};
        // we get this property name. for instance, <a data-property-color="red" /> would mean var property = color
        var property = attribute.name.split("data-property-")[1];
        // following the previous example, attribute.value = red, so we set properties['color'] = red
        properties[property] = attribute.value;
      }
    });
    if (analytics in document) analytics.track(event, properties);
  });
});
