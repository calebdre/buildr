FROM python:latest
RUN apt-get update -y
RUN mkdir /app
COPY requirements.txt /app
WORKDIR /app
RUN pip install -r requirements.txt
COPY . /app
CMD ["python", "app.py"]
