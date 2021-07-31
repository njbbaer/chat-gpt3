let previousText;

$(document).ready(() => {
  $('#api-key-input').val(localStorage.getItem('api-key'));
  $('#text-input').val(
    'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\n' +
    'Human: Hello, who are you?\n' +
    'AI: I am an AI created by OpenAI. How can I help you today?'
  );
  updateCostEstimate();

  $('#submit-button').click(() => {
    updateTextInput($('#text-input').val() + '\nHuman: ' + $('#chat-input').val());
    $('#chat-input').val('');
    generateCompletion();
  });

  $('#retry-button').click(() => {
    if (previousText) {
      $('#text-input').val(previousText);
      generateCompletion();
    }
  });

  $('#api-key-input').change(() => {
    localStorage.setItem('api-key', $('#api-key-input').val());
  });
});

const generateCompletion = async () => {
  previousText = $('#text-input').val();
  const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
    method: 'POST',
    body: JSON.stringify({
      'prompt': $('#text-input').val() + '\nAI:',
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
  const text = json['choices'][0]['text'];
  updateTextInput(text);
  updateCostEstimate(text.length);
}

const updateTextInput = (text) => {
  $('#text-input').val(text);
  $('#text-input').scrollTop($('#text-input')[0].scrollHeight);
}


const updateCostEstimate = (addChars = 0) => {
  let totalChars = Number(sessionStorage.getItem('total-chars')) || 0
  totalChars += addChars
  sessionStorage.setItem('total-chars', totalChars);
  const cost = (totalChars / 4 / 1024 * 0.06).toFixed(2);
  $('#cost-estimate').text('💸 $' + cost);
}
