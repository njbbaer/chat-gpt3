let previousText;

$(document).ready(() => {
  $('#api-key-input').val(sessionStorage.getItem('api-key'));
  $('#text-input').val(
    'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\n' +
    'Human: Hello, who are you?\n' +
    'AI: I am an AI created by OpenAI. How can I help you today?'
  );

  $('#submit-button').click(() => {
    $('#text-input').val($('#text-input').val() + '\n' + $('#chat-input').val() + '\n')
    $('#chat-input').val('Human: ');
    generateCompletion();
  });

  $('#retry-button').click(() => {
    if (previousText) {
      $('#text-input').val(previousText);
      generateCompletion();
    }
  });

  $('#api-key-input').change(() => {
    sessionStorage.setItem('api-key', $('#api-key-input').val());
  });
});

const generateCompletion = async () => {
  previousText = $('#text-input').val()
  const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
    method: 'POST',
    body: JSON.stringify({
      'prompt': $('#text-input').val() + 'AI:',
      'max_tokens': 128,
      'stop': '\n',
      'echo': true
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${$('#api-key-input').val()}`
    }
  });
  const json = await response.json();
  $('#text-input').val(json['choices'][0]['text']);
}
