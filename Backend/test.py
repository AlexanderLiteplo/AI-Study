from flask import Flask
import google.generativeai as genai

application = Flask(__name__)  # AWS Elastic Beanstalk expects an 'application' callable by default.

@application.route("/api/v1/prompt", method=['POST'])
def prompt():
    if Flask.request.method == 'POST':
        PROMPT = 'You as a assistant to Andrew Huberman, pick the vitamins or supplements that he suggests for the user asked input of'+request.form['promptdata']+'JUST MENTION THE SUPPLEMENT OR PROTEIN NOTHING ELSE.'
        MODEL = 'gemini-pro'
        # print('** GenAI text: %r model & prompt %r\n' % (MODEL, PROMPT))

        genai.configure(api_key='AIzaSyASZwo5T5jF_uCYHwX_KO_Mds7W9xzgDFU')
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(PROMPT)
        return response.text
    else:
        return 'Invalid request.'

if __name__ == '__main__':
    application.run(host='0.0.0.0', port=5000)
