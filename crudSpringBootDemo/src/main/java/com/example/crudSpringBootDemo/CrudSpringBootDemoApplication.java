package com.example.crudSpringBootDemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;

@SpringBootApplication
public final class CrudSpringBootDemoApplication {

	public static void main(String[] args) {

		SpringApplication.run(CrudSpringBootDemoApplication.class, args);

	}

}