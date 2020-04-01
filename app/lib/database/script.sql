------------------------------------------------------------------------------------------------------------------------------------------------
-- Check dupplicate data
------------------------------------------------------------------------------------------------------------------------------------------------
drop FUNCTION check_duplicate_data;
create or replace FUNCTION check_duplicate_data(currency_symbol_param varchar(100), affiliate_type_id_param integer, from_date timestamptz, to_date timestamptz) RETURNS integer AS $$
DECLARE
  curs CURSOR FOR SELECT * FROM affiliate_requests where currency_symbol = currency_symbol_param AND affiliate_type_id = affiliate_type_id_param ;
  row  RECORD;
  result integer := 0;
begin
	open curs;
	LOOP
		FETCH FROM curs INTO row;
		EXIT WHEN NOT FOUND;

	IF row.from_date > to_date or row.to_date < from_date THEN
		-- No duplicate
	ELSEIF row.from_date >= from_date and row.from_date <= to_date  THEN
		result := result +1;
	ELSEIF row.to_date >= from_date and row.to_date <= to_date THEN
		result := result +1;
	ELSEIF from_date >= row.from_date and from_date <= row.to_date THEN
		result := result +1;
	ELSEIF to_date >= row.from_date and to_date <= row.to_date THEN
		result := result +1;
	END IF;

	END LOOP;
	CLOSE curs;

	RETURN result;
END; $$
LANGUAGE PLPGSQL;

/*
SELECT check_duplicate_data('ETH', 2, '2020-03-02 06:00:00', '2020-03-03 07:00:00');
*/
