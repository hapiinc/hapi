/**
 * Safety net against scripts that are not closed properly.
 */
;
(/**
 * The motivation for this script is to allow for further styling of a natural language form when Javascript is enabled
 * within a User Agent.
 *
 * @param window represents a window containing a DOM document.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window
 */
    function (window) {

    'use strict';

    /**
     * Add ECMA262-5 String trim() if not supported natively.
     */
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    /**
     * Specify a function to execute when the DOM is fully loaded.
     * @see http://api.jquery.com/ready/
     */
    $(window.document).ready(function () {
        var forms = $('.nlForm'),
            openField = null,
            open = function (event) {
                event.preventDefault();
                event.stopPropagation();

                if (!openField) {
                    openField = $(this).parent().addClass('nlFieldOpen');
                }
            },
            close = function (event) {
                event.preventDefault();
                event.stopPropagation();

                if (!!openField) {
                    var element = $(this);
                    if (openField.is('.nlSelect') && element.is('li')) {
                        openField.find('.nlSelectChecked').removeClass('nlSelectChecked');
                        openField.find('a').html(element.html());
                        openField.next().val(element.val());
                        element.addClass('nlSelectChecked');
                    } else if (openField.is('.nlInput')) {
                        var input = openField.find('input').blur(),
                            value = input.val(),
                            placeholder = input.attr('placeholder');
                        openField.find('a').html(value.trim() !== '' ? value : placeholder);
                        openField.next().val(value);
                    }
                    openField.removeClass('nlFieldOpen');
                    openField = null;
                }
            };

        forms.find('.nlOverlay').on('click touchstart', close);
        forms.find('input, select').each(function (index, element) {
            element = $(element);

            var fieldClass = '',
                toggle = '',
                overlayContent = $('<ul></ul>');

            if (element.is('input')) {
                var inputPlaceholder = element.attr('placeholder'),
                    inputDataSubline = element.attr('data-subline');
                fieldClass = 'nlInput';
                toggle = inputPlaceholder;
                overlayContent
                    .append(
                        $('<li></li>')
                            .append(
                                $('<input class="nlInputField" type="text"></input>')
                                    .attr('placeholder', inputPlaceholder)
                            )
                            .append($('<button class="nlInputSubmit">Go</button>').on('click touchstart', close))
                    )
                    .append($('<li class="nlInputExample"></li>').html(inputDataSubline))
            } else {
                fieldClass = 'nlSelect';
                toggle = element.find('option:selected').html();
                element
                    .find('option')
                    .each(function (index, element) {
                        var option = $(element),
                            listItem = $('<li></li>').html(option.html()).on('click touchstart', close);

                        if (option.is(':selected')) {
                            listItem.addClass('nlSelectChecked');
                        }

                        overlayContent.append(listItem);
                    });
            }

            $('<div class="nlField"></div>')
                .addClass(fieldClass)
                .append($('<a></a>').html(toggle).on('click touchstart', open))
                .append(overlayContent)
                .insertBefore(element);
            element.hide();
        });
    });
})(window);
