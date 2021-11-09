let previousText;
let aiName;

$(document).ready(() => {
  $('#api-key-input').val(localStorage.getItem('api-key'));
  updateCostEstimate();
});

$('#submit-button').click(() => {
  const textInput = $('#text-input').val();
  const chatInput = $('#chat-input').val();
  const userName = $('#user-name').text();
  if (chatInput) {
    updateTextInput(`${textInput}\n${userName}${chatInput}`);
  }
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

$("#template-dropdown a").click(function() {
  $("#submit-button").prop("disabled", false);
  $("#retry-button").prop("disabled", false);

  let selectedTemplate = $(this).text();
  $("#selected-template").text(selectedTemplate);
  if (selectedTemplate === 'AI Chat') {
    aiName = 'AI:'
    $('#user-name').text('Human: ');
    $('#text-input').val(
      'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\n'
      + 'Human: Hello, who are you?\n'
      + 'AI: I am an AI created by OpenAI. How can I help you today?',
    );
  } else if (selectedTemplate === 'Fluttershy Therapist') {
    aiName = 'Fluttershy:'
    $('#user-name').text('Client: ');
    $('#text-input').val(
      'Fluttershy is a character from My Little Pony Friendship is Magic who has opened a therapy practice. Fluttershy is kind, empathetic, and a good listener to her clients, whom she helps deal with their problems. The following is a transcript of a conversation between Flutttershy and a recent client.\n\n'
      + 'Fluttershy: Hello dear. How are you feeling today?'
    )
  }
});

const generateCompletion = async () => {
  const textInput = $('#text-input').val();
  previousText = textInput;
  const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
    method: 'POST',
    body: JSON.stringify({
      prompt: `${textInput} \n${aiName}`,
      max_tokens: 128,
      stop: '\n',
      echo: true,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${$('#api-key-input').val()}`,
    },
  });
  const json = await response.json();
  const { text } = json.choices[0];
  updateTextInput(text);
  updateCostEstimate(text.length);
};

const updateTextInput = (text) => {
  $('#text-input').val(text);
  $('#text-input').scrollTop($('#text-input')[0].scrollHeight);
};

const updateCostEstimate = (addChars = 0) => {
  let totalChars = Number(sessionStorage.getItem('total-chars')) || 0;
  totalChars += addChars;
  sessionStorage.setItem('total-chars', totalChars);
  const cost = ((totalChars / 4 / 1024) * 0.06).toFixed(2);
  $('#cost-estimate').text(`💸 $${cost}`);
};
