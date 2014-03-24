/**
 * The semi-colon before the function invocation is a safety net against concatenated scripts and/or other plugins that
 * are not closed properly.
 */
;
(function () {
    /**
     * For client-side web development noobs like me,
     * Each web page loaded in the browser has its own document object.
     * The Document interface serves as an entry point to the web page's content (the DOM tree, including elements such
     * as <body> and <table>) and provides functionality global to the document (such as obtaining the page's URL and
     * creating new elements in the document).
     *
     * A document object can be obtained from various APIs:
     * Most commonly, you work with the document the script is running in by using document in document's scripts.
     * (The same document can also be referred to as window.document.)
     * The document of an iframe via the iframe's contentDocument property.
     * The responseXML of an XMLHttpRequest object.
     * The document that a given node or element belongs to can be retrieved using the node's ownerDocument property.
     */
    $(document).ready(function () {
        /**
         * Find all elements in the DOM tree that are classified as:
         * - modal-overlay
         * - modal-trigger
         *
         * The Modal Overlay Element is a div {Element} that occupies the entire window used to present the modal view.
         * The Modal Trigger Elements are a {NodeList} of {Element}s that will be used to trigger the display of any
         * modal view upon click.
         */
        var modalOverlayElement = $('.modal-overlay'),
            modalTriggerElements = $('.modal-trigger');

        if (modalOverlayElement.length > 0 && modalTriggerElements.length > 0) {
            modalTriggerElements.each(function (index, element) {
                var modalId = $(element).attr('data-modal'),
                    modalElement = $('#' + modalId),
                    closeElement = $(modalElement).find('.modal-close');

                $(element).on('click', function (event) {
                    $(modalElement).addClass('modal-show');
                    $(modalOverlayElement).off('click');
                    $(modalOverlayElement).on('click', function () {
                        $(modalElement).removeClass('modal-show');
                    });
                });

                $(closeElement).on('click', function (event) {
                    event.stopPropagation();
                    $(modalElement).removeClass('modal-show');
                });
            });
        }
    });
})();
