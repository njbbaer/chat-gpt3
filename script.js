$(document).ready(() => {
  $('#prompt-input').val(
    'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\n' +
    'Human: Hello, who are you?\n' +
    'AI: I am an AI created by OpenAI. How can I help you today?'
  );

  $('#api-key').val(sessionStorage.getItem('api-key'));

  $('#submit-button').click(() => {
    $('#prompt-input').val(
      $('#prompt-input').val() + '\n' + $('#speech-input').val() + '\n'
    );
    $('#speech-input').val('Human: ');
    sessionStorage.setItem('api-key', $('#api-key').val());
    generateCompletion();
  });
});

const generateCompletion = async () => {
  const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
    method: 'POST',
    body: JSON.stringify({
      'prompt': $('#prompt-input').val() + 'AI:',
      'max_tokens': 128,
      'stop': '\n',
      'echo': true
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${$('#api-key').val()}`
    }
  });
  const json = await response.json();
  $('#prompt-input').val(json['choices'][0]['text']);
}
