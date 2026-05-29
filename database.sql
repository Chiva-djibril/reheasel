CREATE DATABASE smartPark;
USE smartPark;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE Spare_Part (
  Name VARCHAR(100) PRIMARY KEY,
  Category VARCHAR(100),
  Quantity INT,
  UnitPrice DECIMAL(10,2),
  TotalPrice DECIMAL(10,2)
);

CREATE TABLE Stock_In (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100),
  StockInQuantity INT,
  StockInDate DATE,
  FOREIGN KEY (Name) REFERENCES Spare_Part(Name)
);

CREATE TABLE Stock_Out (
  id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100),
  StockOutQuantity INT,
  StockOutUnitPrice DECIMAL(10,2),
  StockOutTotalPrice DECIMAL(10,2),
  StockOutDate DATE,
  FOREIGN KEY (Name) REFERENCES Spare_Part(Name)
);