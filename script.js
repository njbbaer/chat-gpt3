import templates from './templates.json' assert { type: 'json' };

let previousText;

// ------
// EVENTS
// ------

$(document).ready(() => {
  $('#inputApiKey').val(localStorage.getItem('api-key'));
  updateCostEstimate();
});

$('#buttonSubmit').click(() => {
  submit();
});

$(document).on('keypress', (e) => {
  // On enter key
  if (e.which === 13) {
    submit();
  }
});

$('#buttonRetry').click(() => {
  if (previousText) {
    $('#textareaChat').text(previousText);
    generateCompletion();
  }
});

$('#inputApiKey').change(() => {
  localStorage.setItem('api-key', $('#inputApiKey').val());
});

$('#dropdownTemplate a').click(function() {
  const selectedTemplate = $(this).text();
  $('#buttonTemplate').text(selectedTemplate);
  applyTemplate(selectedTemplate)
});

// ---------
// FUNCTIONS
// ---------

const submit = () => {
  const textareaChat = $('#textareaChat').text();
  const inputChat = $('#inputChat').val();
  const inputUserName = $('#inputUserName').val();
  if (inputChat && inputUserName) {
    updateTextInput(`${textareaChat}\n${inputUserName}: ${inputChat}`);
  } else {
    updateTextInput(`${textareaChat}${inputChat}`);
  }
  $('#inputChat').val('');
  generateCompletion();
};

const generateCompletion = async () => {
  const textareaChat = $('#textareaChat').text();
  const inputAiName = $('#inputAiName').val();
  const temperature = parseFloat($('#rangeTemperature').val());
  previousText = textareaChat;
  const prompt = inputAiName ? `${textareaChat} \n${inputAiName}:` : textareaChat;
  const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      max_tokens: 128,
      stop: '\n',
      echo: true,
      temperature,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${$('#inputApiKey').val()}`,
    },
  });
  const json = await response.json();
  const { text } = json.choices[0];
  updateTextInput(text);
  updateCostEstimate(text.length);
};

const updateTextInput = (text) => {
  $('#textareaChat').text(text);
  $('#textareaChat').scrollTop($('#textareaChat')[0].scrollHeight);
};

const updateCostEstimate = (addChars = 0) => {
  let totalChars = Number(sessionStorage.getItem('total-chars')) || 0;
  totalChars += addChars;
  sessionStorage.setItem('total-chars', totalChars);
  const cost = ((totalChars / 4 / 1024) * 0.06).toFixed(2);
  $('#costEstimate').text(`💸 $${cost}`);
};

const applyTemplate = (selectedTemplate) => {
  const template = templates.find((t) => t.label === selectedTemplate);
  $('#inputUserName').val(template.userName);
  $('#inputAiName').val(template.aiName);
  $('#textareaChat').text(template.prompt);
  $('#rangeTemperature').val(template.temperature);
}