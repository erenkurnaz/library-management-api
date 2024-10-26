export const USER_WITH_BORROW_HISTORY = `
    SELECT 
      u.id,
      u.name,
      JSON_AGG(
        CASE 
          WHEN ub.returned_at IS NOT NULL THEN JSON_BUILD_OBJECT('name', b.name, 'userScore', ub.user_score)
          ELSE NULL
        END
      ) FILTER (WHERE ub.returned_at IS NOT NULL) AS past,
      JSON_AGG(
        CASE 
          WHEN ub.returned_at IS NULL THEN JSON_BUILD_OBJECT('name', b.name)
          ELSE NULL
        END
      ) FILTER (WHERE ub.returned_at IS NULL) AS present
    FROM 
      users u
    LEFT JOIN 
      user_borrowed_books ub ON u.id = ub.user_id
    LEFT JOIN 
      books b ON ub.book_id = b.id
    WHERE 
      u.id = ?
    GROUP BY 
      u.id
    `;
