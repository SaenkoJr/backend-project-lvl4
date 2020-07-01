import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import $ from 'jquery';

$(() => {
  $('#confirm').on('show.bs.modal', function handler(event) {
    const button = $(event.relatedTarget);
    const method = button.data('method');
    const action = button.data('action');

    const modal = $(this);
    modal.find('#confirmForm').attr('action', action);
    modal.find('#method').val(method);
  });

  $('#submitForm').submit(function handler() {
    $(this).find('[type=submit]').prop('disabled', true);
  });

  $('#confirmForm').submit(function handler() {
    $(this).find('[type=submit]').prop('disabled', true);
  });
});
