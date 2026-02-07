import pandas as pd
import sqlite3
import os


def start_the_forge():
    print("AutoHero: starting the data forge...")

    # Load raw files
    try:
        df_cars = pd.read_csv("../raw_data/cars.csv")
        df_bikes = pd.read_csv("../raw_data/bikes.csv")
    except FileNotFoundError:
        print("Raw files could not found")
        return

    # Transform data
    # mapping to specific columns name
    car_mapping = {
        "brand": "brand",
        "model": "model",
        "price": "price",
        "yearOfRegistration": "year",
        "kilometer": "odometer",
        "powerPS": "engine_cc",
    }

    cars_clean = df_cars.rename(columns=car_mapping)
    cars_clean = cars_clean[
        ["brand", "model", "year", "odometer", "engine_cc", "price"]
    ]
    cars_clean["vehicle_type"] = "car"

    bike_mapping = {
        "brand": "brand",
        "bike_name": "model",
        "kms_driven": "odometer",
        "power": "engine_cc",
        "price": "price",
    }

    bikes_clean = df_bikes.rename(columns=bike_mapping)
    bikes_clean["year"] = 2022
    bikes_clean = bikes_clean[
        ["brand", "model", "year", "odometer", "engine_cc", "price"]
    ]
    bikes_clean["vehicle_type"] = "bike"

    # combine into one master inventory
    master_df = pd.concat([cars_clean, bikes_clean], ignore_index=True)

    # load into SQlite db
    conn = sqlite3.connect("autohero.db")  # craete database name autohero automatically
    master_df.to_sql("inventory", conn, if_exists="replace", index=False)
    conn.close()

    print(f"Success! {len(master_df)} vehicles are now in the AutoHero database.")
    print("New file created: autohero.db")


if __name__ == "__main__":
    start_the_forge()
